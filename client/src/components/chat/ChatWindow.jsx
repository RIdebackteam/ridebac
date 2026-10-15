import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { formatTime } from '../../utils/formatters'

export default function ChatWindow({ rideId, receiverId, initialMessages = [] }) {
  const { user } = useAuth()
  const { messages: contextMessages, sendMessage, joinRoom, socket } = useChat()
  const [text, setText] = useState('')
  const [allMessages, setAllMessages] = useState(initialMessages)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    joinRoom(rideId)
  }, [rideId, joinRoom])

  useEffect(() => {
    setAllMessages([...initialMessages, ...contextMessages.filter(m => m.rideId === rideId)])
  }, [initialMessages, contextMessages, rideId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(rideId, receiverId, text)
    setText('')
  }

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden border border-slate-700">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h3 className="font-semibold text-white">Ride Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((msg, i) => {
          const isMe = msg.senderId === user._id
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-100 rounded-tl-none'}`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] opacity-70 mt-1 block text-right">
                  {formatTime(new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-800/30 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
        />
        <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50" disabled={!text.trim()}>
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
