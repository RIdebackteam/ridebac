import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft, Phone, MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useChat } from '../../context/ChatContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatTime, timeAgo } from '../../utils/formatters'

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex gap-2 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end">
        {msg.senderId?.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isMe && (
          <p className="text-xs text-slate-400 ml-1">{msg.senderId?.name}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
          isMe
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-slate-700 text-slate-100 rounded-bl-sm'
        }`}>
          {msg.text}
        </div>
        <p className="text-xs text-slate-500 mx-1">
          {msg.createdAt ? timeAgo(msg.createdAt) : 'just now'}
        </p>
      </div>
    </div>
  )
}

export default function Chat() {
  const { rideId } = useParams()
  const { user } = useAuth()
  const { joinRoom, sendMessage, messages, setMessages, typing } = useChat()
  const [ride, setRide] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      try {
        // Load ride info + chat history
        const [rideRes, msgRes] = await Promise.all([
          api.get(`/rides/${rideId}`),
          api.get(`/messages/${rideId}`),
        ])
        const rideData = rideRes.data.data.ride
        setRide(rideData)
        setMessages(msgRes.data.data.messages)

        // Determine the other party for sending
        if (user.role === 'passenger') {
          setOtherUser(rideData.driverId?.userId)
        } else {
          // For driver, find a confirmed passenger (use first booking's passenger)
          // This simplified version uses first message sender as receiver
          const msgs = msgRes.data.data.messages
          const other = msgs.find((m) => m.senderId?._id !== user._id)
          if (other) setOtherUser(other.senderId)
        }

        joinRoom(rideId)
      } catch {
        toast.error('Could not load chat. Make sure you have a confirmed booking.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [rideId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    const trimmed = text.trim()
    setText('')
    setSending(true)
    try {
      sendMessage(rideId, otherUser?._id, trimmed)
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const isTyping = Object.entries(typing).some(([uid, t]) => t && uid !== user?._id)

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col" style={{ height: '100vh' }}>
      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full px-4 pb-4 gap-4">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-72 gap-4 pt-8">
          <Link to={`/rides/${rideId}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Ride
          </Link>

          {/* Ride Info */}
          {ride && (
            <div className="glass p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Ride Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{ride.source} → {ride.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                  {formatDate(ride.date)} at {formatTime(ride.time)}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {otherUser && (
            <div className="glass p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Chatting with</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  {otherUser.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{otherUser.name}</p>
                  {otherUser.phone && (
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {otherUser.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col pt-8 min-w-0">
          {/* Header */}
          <div className="glass p-4 mb-4 flex items-center gap-3">
            <Link to={`/rides/${rideId}`} className="md:hidden text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              {otherUser?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{otherUser?.name || 'Chat'}</p>
              <p className="text-xs text-emerald-400">
                {isTyping ? 'typing...' : 'Online'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 glass overflow-y-auto p-4 space-y-1">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-slate-400">No messages yet. Say hello!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  msg={msg}
                  isMe={msg.senderId?._id === user?._id || msg.senderId === user?._id}
                />
              ))
            )}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="flex gap-1 px-4 py-3 bg-slate-700 rounded-2xl rounded-bl-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 mt-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field flex-1"
              placeholder="Type a message..."
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="btn-primary px-4 py-3 flex items-center justify-center disabled:opacity-50 disabled:transform-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
