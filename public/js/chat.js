const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');

// Options
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Auto scrolling
const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //  visible height
    const visibleHeight = messages.offsetHeight

    // height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

socket.on('message', (message) => {
    console.log(message)
    // passing the data into the template
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// listening for location message
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})


messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    // disable the form
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        messageFormButton.removeAttribute('disabled')
        // clear the input field
        messageFormInput.value = '';
        //  focus input field
        messageFormInput.focus()
        // enable the form

        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

sendLocationButton.addEventListener('click', () => {
    // disable the location once it's being sent
    sendLocationButton.setAttribute('disabled', 'disabled')

    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }


    // fetching the location with cordinates 
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enabling the sendlocation button after being fetch
            sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})