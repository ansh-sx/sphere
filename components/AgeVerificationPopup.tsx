import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface AgeVerificationPopupProps {
  onVerify: () => void;
}

export default function AgeVerificationPopup({ onVerify }: AgeVerificationPopupProps) {
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = () => {
    setIsVerified(true)
    onVerify()
  }

  if (isVerified) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
      <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full">
        <div className="text-6xl text-center mb-4">🔞</div>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Age Verification</h2>
        <p className="text-white mb-6 text-center">
          Only users 18 years and older are allowed to enter Era Chat. This chat involves interactions with random strangers. 
          Please be aware of potential risks and do not share sensitive personal information.
        </p>
        <Button onClick={handleVerify} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          I'm 18+ - Enter the Chat
        </Button>
      </div>
    </div>
  )
}

