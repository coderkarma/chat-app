const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');


const app = express()
// created server
const server = http.createServer(app)
// creating instance of socket.io
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.emit('message', generateMessage('Welcome'))
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    // listening from sendMessage
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessage(message))
        callback()
    })

    //  listening from sendlocation
    socket.on('sendLocation', (coords, callback) => {
        // share data to all collective clients
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })
    // If user is disconnect sent the message 
    socket.on('disconnect', () => {
        io.emit('message', generateMessage(' A user has left!'))
    })
})

// starting up server
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})