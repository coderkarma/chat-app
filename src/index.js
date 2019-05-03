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

let count = 0;

io.on('connection', (socket) => {
    console.log('new websocket connection')

    // emit accept eventname as a frist argumment
    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++
        io.emit('countUpdated', count)
    })

})

// starting up server
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})