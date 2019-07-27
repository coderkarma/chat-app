const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words');
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
} = require('./utils/user')


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

    socket.on('join', (options, callback) => {
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            ...options
        })

        if (error) {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()

    })

    // listening from sendMessage
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    //  listening from sendlocation
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        // share data to all collective clients
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })
    // If user is disconnect sent the message 
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

    })
})

// starting up server
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})