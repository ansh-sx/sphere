'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit2, Instagram, Crown, ChevronUp, LinkIcon, Youtube, Coffee, Globe } from 'lucide-react'
import { format, isToday, isYesterday, isSameYear, differenceInDays } from 'date-fns'
import AgeVerificationPopup from './AgeVerificationPopup'
import { motion, AnimatePresence } from 'framer-motion'

const supabaseUrl = 'https://pnmnimfdvbmoxuvbmayo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubW5pbWZkdmJtb3h1dmJtYXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MjY5MTgsImV4cCI6MjA0ODAwMjkxOH0.FBk1mlB3ZSaVfIWVc4zj5tzB7cHKyd0wDJxpDqvenX0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function generateRandomUsername() {
  return `User${Math.floor(Math.random() * 10000)}`
}

function generateGradient() {
  const colors = [
    '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#800080', '#FFC0CB', '#FFA500', '#008080',
    '#4B0082', '#00FFFF', '#00FF00', '#FFD700', '#50C878', '#8A2BE2', '#FF00FF', '#FF007F',
    '#E6E6FA', '#98FB98', '#DDA0DD', '#F0E68C', '#87CEEB', '#FF69B4', '#CD853F', '#00FA9A',
    '#FF4500', '#9370DB', '#00CED1', '#FF8C00', '#BA55D3', '#20B2AA', '#FF1493', '#32CD32'
  ]
  const color1 = colors[Math.floor(Math.random() * colors.length)]
  const color2 = colors[Math.floor(Math.random() * colors.length)]
  return `linear-gradient(45deg, ${color1}, ${color2})`
}

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [username, setUsername] = useState(() => {
    const savedUsername = localStorage.getItem('sphere_username')
    return savedUsername || generateRandomUsername()
  })
  const [displayUsername, setDisplayUsername] = useState(username)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showRefreshNotification, setShowRefreshNotification] = useState(false)
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem('sphere_age_verified') === 'true'
  })
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [userGradient, setUserGradient] = useState(() => {
    const savedGradient = localStorage.getItem('sphere_gradient')
    return savedGradient || ''
  })
  const [activeUsers, setActiveUsers] = useState(0)

  useEffect(() => {
    if (isAgeVerified) {
      fetchMessages()
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          setMessages(current => [payload.new, ...current])
          if (!isScrolledToTop()) {
            setUnreadMessages(prev => prev + 1)
            setShowScrollButton(true)
          } else {
            scrollToTop()
          }
        })
        .subscribe()

      if (!userGradient) {
        getUserGradient()
      }
      trackActiveUsers()

      return () => {
        supabase.removeChannel(channel)
        removeActiveUser()
      }
    }
  }, [isAgeVerified])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToTop()
    }
  }, [messages])

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < username.length) {
        setDisplayUsername(username.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [username])

  const isScrolledToTop = () => {
    if (scrollAreaRef.current) {
      return scrollAreaRef.current.scrollTop === 0
    }
    return false
  }

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
      setUnreadMessages(0)
      setShowScrollButton(false)
    }
  }

  const handleScroll = () => {
    if (isScrolledToTop()) {
      setUnreadMessages(0)
      setShowScrollButton(false)
    } else {
      setShowScrollButton(true)
    }
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
      setTimeout(scrollToTop, 100)
    }
  }

  const getUserGradient = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('gradient')
      .eq('username', username)
      .single()

    if (error || !data) {
      const newGradient = generateGradient()
      const { error: insertError } = await supabase
        .from('users')
        .insert({ username, gradient: newGradient })
      
      if (insertError) {
        console.error('Error saving user gradient:', insertError)
      } else {
        setUserGradient(newGradient)
        localStorage.setItem('sphere_gradient', newGradient)
        localStorage.setItem('sphere_username', username)
      }
    } else {
      setUserGradient(data.gradient)
      localStorage.setItem('sphere_gradient', data.gradient)
      localStorage.setItem('sphere_username', username)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || newMessage.length > 500) return

    const filteredMessage = filterProfanity(newMessage)

    const { error } = await supabase
      .from('messages')
      .insert({ content: filteredMessage, username, user_gradient: userGradient })

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
      fetchMessages()
    }
  }

  const filterProfanity = (text: string) => {
    const profanityList = ['fuck', 'shit', 'ass', 'sex', 'damn', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'boob']
    return text.split(' ').map(word => 
      profanityList.includes(word.toLowerCase()) 
        ? word.charAt(0) + '*'.repeat(word.length - 2) + word.charAt(word.length - 1)
        : word
    ).join(' ')
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditingUsername(false)
    
    localStorage.setItem('sphere_username', username)
    
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('gradient', userGradient)

    if (error) {
      console.error('Error updating username:', error)
    } else {
      fetchMessages()
    }
  }


  const trackActiveUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('active_users')
        .upsert({ user_id: user.id, last_active: new Date().toISOString() })
      
      if (error) {
        console.error('Error tracking active user:', error)
      }
    }

    const channel = supabase
      .channel('active_users')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        setActiveUsers(Object.keys(presenceState).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user?.id })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }

  const removeActiveUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('active_users')
        .delete()
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error removing active user:', error)
      }
    }
  }

  const renderMessage = (message: any) => {
    const words = message.content.split(' ')
    return words.map((word: string, index: number) => {
      if (word.startsWith('@')) {
        const username = word.slice(1)
        return (
          <a
            key={index}
            href={`https://www.instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center"
          >
            <Instagram size={16} className="mr-1" />
            {word}
          </a>
        )
      } else if (isValidUrl(word)) {
        return (
          <a
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline inline-flex items-center"
          >
            <LinkIcon size={16} className="mr-1" />
            {word}
          </a>
        )
      }
      return <span key={index}>{word} </span>
    })
  }

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  }

  const getMessageStyle = (username: string) => {
    if (username.toLowerCase() === 'era') {
      return 'text-yellow-400'
    } else if (username.toLowerCase() === 'sigma') {
      return 'text-amber-700'
    } else if (username.toLowerCase() === 'ansh') {
      return 'text-gray-400'
    }
    return 'text-white'
  }

  const getCrownStyle = (username: string) => {
    if (username.toLowerCase() === 'era') {
      return 'text-yellow-400'
    } else if (username.toLowerCase() === 'sigma') {
      return 'text-amber-700'
    } else if (username.toLowerCase() === 'ansh') {
      return 'text-gray-400'
    }
    return ''
  }

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else if (isSameYear(date, new Date())) {
      return format(date, 'MMM d')
    } else {
      return format(date, 'MMM d, yyyy')
    }
  }

  if (!isAgeVerified) {
    return <AgeVerificationPopup onVerify={() => {
      setIsAgeVerified(true)
      localStorage.setItem('sphere_age_verified', 'true')
      setTimeout(scrollToTop, 100) 
    }} />
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {showRefreshNotification && (
        <div className="bg-blue-500 text-white p-4 text-center">
          Please refresh the website. Previous data has been refreshed. Please start a new chat. This will occur daily at 12:00 AM UTC.
        </div>
      )}
      <div className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sphere</h1>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full mr-3" 
            style={{background: userGradient}}
          ></div>
          {isEditingUsername ? (
            <form onSubmit={handleUsernameChange} className="flex items-center">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mr-2 bg-gray-800 text-white rounded-full h-12 focus:ring-0 focus:ring-offset-0 focus:outline-none border-none"
                autoFocus
              />
              <Button type="submit" className="bg-gray-700 text-white hover:bg-gray-600">Save</Button>
            </form>
          ) : (
            <>
              <span className="mr-2">{displayUsername}</span>
              <Button onClick={() => setIsEditingUsername(true)} className="bg-gray-700 text-white hover:bg-gray-600 p-2">
                <Edit2 size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="bg-yellow-500 text-black p-2 text-center text-sm">
        <p>Don't share sensitive information with others.</p>
        <div className="flex justify-center items-center space-x-4 mt-1">
          <a href="https://www.buymeacoffee.com/ansh_sx" target="_blank" rel="noopener noreferrer" className="underline flex items-center">
            <Coffee size={16} className="mr-1" />
            Support Us
          </a>
          <a href="https://www.youtube.com/@era.search" target="_blank" rel="noopener noreferrer" className="underline flex items-center">
            <Youtube size={16} className="mr-1" />
            YouTube
          </a>
          <a href="https://www.instagram.com/erasearch" target="_blank" rel="noopener noreferrer" className="underline flex items-center">
            <Instagram size={16} className="mr-1" />
            Instagram
          </a>
          <a href="https://erainc.vercel.app" target="_blank" rel="noopener noreferrer" className="underline flex items-center">
            <Globe size={16} className="mr-1" />
            Website
          </a>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4 overflow-y-auto" ref={scrollAreaRef} onScrollCapture={handleScroll}>
        {isRefreshing ? (
          <div className="text-center text-white">
            Loading messages...
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.id}-${message.created_at}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mb-4 flex items-start"
              >
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex-shrink-0" 
                    style={{background: message.user_gradient}}
                  ></div>
                  {['era', 'sigma', 'ansh'].includes(message.username.toLowerCase()) && (
                    <Crown size={16} className={`absolute -top-2 -right-2 transform rotate-45 ${getCrownStyle(message.username)}`} />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-white">{message.username}</div>
                  <div className={getMessageStyle(message.username)}>{renderMessage(message)}</div>
                </div>
                <div className="text-gray-400 text-sm">
                  {formatMessageDate(new Date(message.created_at))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </ScrollArea>
      {showScrollButton && (
        <Button
          className="absolute top-20 right-4 bg-blue-500 text-white rounded-full p-2"
          onClick={scrollToTop}
        >
          <ChevronUp size={20} />
          {unreadMessages > 0 && <span className="ml-1">{unreadMessages}</span>}
        </Button>
      )}
      <form onSubmit={handleSendMessage} className="p-2 bg-gray-900 bg-opacity-50 backdrop-blur-md">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message (max 500 characters)..."
            className="flex-grow bg-gray-800 text-white rounded-full h-12 focus:ring-0 focus:ring-offset-0 focus:outline-none border-none"
            maxLength={500}
          />
          <Button type="submit" className="bg-gray-700 text-white hover:bg-gray-600" disabled={newMessage.length > 500}>Send</Button>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            {activeUsers} active users
          </span>
          <span>{newMessage.length}/500 characters</span>
        </div>
      </form>
    </div>
  )
}

