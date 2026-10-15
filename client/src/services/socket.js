import { io } from 'socket.io-client'

let socket = null

export const getSocket = (token) => {
  if (!socket) {
    socket = io('https://rideback-server.onrender.com', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
