const socket = io();

// Elemnents
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const sendLocationButton = document.querySelector('#send-location');


socket.on('message', (message) => {
    console.log(message)
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