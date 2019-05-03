const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io')

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

    socket.emit('message', 'Welcome')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })

    socket.on('disconnect', () => {
        io.emit('message', ' A user has left!')
    })
})

// starting up server
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})