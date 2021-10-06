const socket = io()//client side js can connect to socket.io using io()

//Elements for form and buttons enable and disable:
//selectors for input,button, location
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input') // looking for input
const $messageFormButton = $messageForm.querySelector('button')//looking for button
const $sendLocationButton = document.querySelector('#send-location') //looking for location
const $messages = document.querySelector('#messages') //looking for rendering messages 

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML //looking for message-template from index.html and to display in innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML //looking for location-message-template
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML  //looking for Sidebar template


//Options for url:
const { username, room}= Qs.parse(location.search,{ ignoreQueryPrefix:true})
//ignoreQueryPrefix:true =>makes ? away in URL

//AUTO SCROLL :

const autoscroll=()=>{
    //New message:
    const $newMessage = $messages.lastElementChild

    //Height of the new msg:
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height
    const visibleHeight = $messages.offsetHeight
   
    // Height of messages container
    const containerHeight = $messages.scrollHeight
   
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) 
    {
    $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    //Rendering the message
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message : message.text ,//short hand operator
        // message:message
        // Mustache.render()=> args: 1. template 2. data
        createdAt:moment(message.createdAt).format('h:mm A')

    })
    $messages.insertAdjacentHTML('beforeend',html)//insert msgs beforeend
    //insertAdjacentHTML()=> to insert template into DOM
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    //Add this to document
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//Accessing Room Data
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//Mustache.render()=> takes params: i.e template name, data
//taking id from chat.html(i.e #sidebar) and rendering inside html 



//Event Listener for form submission:
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //Disable Form Button
    $messageFormButton.setAttribute('disabled', 'disabled')


    //Emit 'sendmsg' with input we enter in form(i.e.string) as msg data
    const message = e.target.elements.message.value //messages is the name of input from index.html
    // const message = document.querySelector('input').value
    socket.emit('sendMessage',message,(error)=>{
        //Enable form 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '' //clearing text from input 
        $messageFormInput.focus() //shift focus back to input

        //setting acknowledge as final argument
        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delivered')

    })
})

//Sending location

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    //Disabling location
    $sendLocationButton.setAttribute('disabled','disabled')

    //when geolocation is supported
    navigator.geolocation.getCurrentPosition((position) => {
    //Client should emit "sendLocation" with the object as data
        //---> obj contains latitude and longitude properties
    
 
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        //Acknowledgment should be passed as final argument
        ()=>{
            
            //Enable location 
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})

