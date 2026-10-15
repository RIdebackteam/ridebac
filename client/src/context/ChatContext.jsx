import { createContext, useContext, useState, useEffect } from 'react'
import { getSocket, disconnectSocket } from '../services/socket'
import { useAuth } from './AuthContext'

const ChatContext = createContext()

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState({})

  useEffect(() => {
    if (token && user) {
      const newSocket = getSocket(token)
      newSocket.connect()
      setSocket(newSocket)

      newSocket.on('new-message', (msg) => {
        setMessages((prev) => [...prev, msg])
      })

      newSocket.on('user-typing', ({ userId, isTyping }) => {
        setTyping((prev) => ({ ...prev, [userId]: isTyping }))
      })

      return () => {
        disconnectSocket()
      }
    }
  }, [token, user])

  const joinRoom = (rideId) => {
    if (socket) {
      socket.emit('join-room', { rideId })
    }
  }

  const sendMessage = (rideId, receiverId, text) => {
    if (socket) {
      const msg = { rideId, receiverId, text, senderId: user._id, timestamp: new Date().toISOString() }
      socket.emit('send-message', msg)
      setMessages((prev) => [...prev, msg])
    }
  }

  const value = {
    socket,
    messages,
    typing,
    joinRoom,
    sendMessage,
    setMessages
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
