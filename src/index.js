const path = require('path') 
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express() //generating new application
const server = http.createServer(app)
const io = socketio(server) //creating socket.io instance by passing server

const port = process.env.PORT || 4001
//serving public directory
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


//when socket.io gets a new connection
io.on('connection',(socket)=>{
    //arg: socket(is a object) => contains information about new connection
    console.log('New WebSocket Connection')
    
    // socket.emit('message','Welcome!!')
   
    //socket.io Rooms for join:
    socket.on('join',(options,callback)=>{
        
        //addUser:
        const {error, user}= addUser({id:socket.id,...options})
        if(error)
        {
            return callback(error)
        }
        
        
        //joining rooms
        socket.join(user.room)//socket.join()=>can be accessed only on server
        
        //io.to.emit() => emits event to everyone in a room
        //socket.broadcast.to.emit =>send to everyone excepts to the specific client(i.e. specific chat room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage( 'Admin',`${user.username} has joined!`))   
        //Used 'Admin' Since these msgs are system generated msgs
          
        //to get users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    
    //Server listening for Sendmsg:
    socket.on('sendMessage',(message,callback)=>{
        //callback is just the argument used for acknowledgement
        
        //Send messages to correct room by fetching user
        const user = getUser(socket.id)
                
        //Profanity not allowed
        const  filter= new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit('message',generateMessage(user.username,message))//emits event for every connections
        callback()
    
    })
    //Server listening for sendLocation and msg should be sent to all users about latitude and longitude
    socket.on('sendLocation',(coords,callback)=>{
        
        //user to send msgs to the room they belong
        const user = getUser(socket.id)

        // io.emit('message',`location: ${coords.latitude},${coords.longitude}`)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        
        callback()//calling acknowldegment
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
             
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
           // used 'Admin' since it is a system generated msg 
            io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
    })
})


server.listen(port,()=>{
    console.log(`Listening on port: ${port}!`)
})

