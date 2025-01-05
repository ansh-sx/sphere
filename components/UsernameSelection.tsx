import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UsernameSelectionProps {
  onUsernameSelected: (username: string) => void;
}

export default function UsernameSelection({ onUsernameSelected }: UsernameSelectionProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onUsernameSelected(username.trim())
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Choose a Username</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="mb-4 bg-gray-800 text-white"
        />
        <Button type="submit" className="w-full bg-gray-700 text-white hover:bg-gray-600">Start Chatting</Button>
      </form>
    </div>
  )
}

