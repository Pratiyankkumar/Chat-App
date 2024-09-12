const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath =  path.join(__dirname, '../public')

app.use(express.json())
app.use(express.static(publicDirectoryPath))


// let count = 0
let receivedMessage = '';

io.on('connection', (socket) => {
  console.log('new WebSocket connection')

  // socket.emit('countUpdated', count)
  

  socket.on('join', (options, callback) => {
    const {error, user} = addUser({ id: socket.id, ...options})

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('welcomeMessage', generateMessage('Welcome'))
    socket.broadcast.to(user.room).emit('welcomeMessage', generateMessage(`${user.username} has joined!`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    })

    callback()
  })

  socket.on('message', (message, callback) => {
    receivedMessage = message

    const user = getUser(socket.id)

    if (user) {
      const filter = new Filter()

      if (filter.isProfane(receivedMessage)) {
        return callback('Profanity is not allowed here')
      }

      io.to(user.room).emit('welcomeMessage', generateMessage(user.username, receivedMessage))

      callback()
    }
  })

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.coords.longitude},${location.coords.latitude}`))
    callback('Location shared successfully')
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('welcomeMessage', generateMessage(`${user.username} has left`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      })
    }
  })

  // socket.on('increment', () => {
  //   count++
  //   //socket.emit('countUpdated', count)

  //   io.emit('countUpdated', count)
  // })
})

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicDirectoryPath })
})

const port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Server is up on port 3000')
})