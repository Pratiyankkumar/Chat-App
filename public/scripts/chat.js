const socket = io()

// Element
const $messageInput = document.querySelector('#js-message');
const $sendButton = document.querySelector('#js-send-button');
const $sendLocationButton = document.querySelector('#js-send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options 
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message element 
  // const $newMessage = $messages.lastElementChild

  // // height of the new message
  // const newMessageStyles = getComputedStyle($newMessage)
  // const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // // Visible height
  // const visibleHeight = $messages.offsetHeight

  // // Height of message Container
  // const containerHeight = $messages.scrollHeight

  // // How far have i scrolled
  // const scrollOffset = $messages.scrollTop + visibleHeight

  // if (containerHeight - newMessageHeight <= scrollOffset) {
  //   $messages.scrollTop = $messages.scrollHeight
  // }

  $messages.scrollTop = $messages.scrollHeight
}

socket.on('welcomeMessage', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (location) => {
  console.log(location)
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
})

$sendButton.addEventListener('click', () => {
  $sendButton.setAttribute('disabled', 'disabled')
  const message = $messageInput.value;

  socket.emit('message', message, (error) => {
    $messageInput.value = ''
    $messageInput.focus()

    $sendButton.removeAttribute('disabled', 'disabled')
    if (error) {
      return console.log(error)
    }

    console.log('Message Delivered')
  })
})

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  } 

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', position, (message) => {
      $sendLocationButton.removeAttribute('disabled')
      console.log(message)
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







// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('clicked')

//   socket.emit('increment')
// })