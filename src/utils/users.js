const users = []

//addUser
const addUser = ({ id,username, room})=>{
    //object with 3 params: id,username,room  
    //1. clean the data like removing extra spaces, lowercase letters
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //2. Validate data
    if(!username||!room)
    {
        return {
            error:'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room ===room && user.username === username 
    })

    //validate username
    if(existingUser){
        return{
            error:'Username is already in use!'
        }
    }

    //Store User
    const user = {id,username,room}
    users.push(user)
    return {user}


}

//removeUser : takes only user Id
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id //true => if user id equals to id we passed 
    })
    if(index !== -1){
        return users.splice(index,1)[0]
        //splice => used to remove items from array using index and 2nd param no.of.items to get removed(i.e here 1)
        //[0]=> to return that particular item
    }

}

//getUser
const getUser = (id)=>{
    return users.find((user)=>{
        return user.id === id
    })

}

//getUsersInRoom // To get users in sidebar in our app
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room) //short hand operation
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}



// //Adding users
// addUser({
//     id:101,
//     username:'Meghana',
//     room:'Amigo'
// })

// addUser({
//     id:102,
//     username:'vandana',
//     room:'Amigo'
// })

// addUser({
//     id:201,
//     username:'Meghana',
//     room:'Dream Project'
// })

// //console.log(users) //To display all users 

// //Testing getUser()
// const user = getUser(201)
// console.log(user)

// //Testing getusersInRoom()
// const userList = getUsersInRoom('Amigo')
// console.log(userList)

// // // To test removeUser() function
// // const removedUser = removeUser(101)
// // console.log(removedUser)
// // console.log(users)
