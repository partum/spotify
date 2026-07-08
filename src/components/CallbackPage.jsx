import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallbackRedirect, storeUserTokens } from '../loginScript'

export default function CallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function processCallback() {
      try {
        const tokenResponse = await handleCallbackRedirect()

        if (tokenResponse?.access_token) {
          storeUserTokens(tokenResponse)
          navigate('/', { replace: true })
        } else {
          setError('No authorization code received from Spotify')
          setIsProcessing(false)
        }
      } catch (err) {
        setError(err.message || 'Failed to process login callback')
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [navigate])

  return (
    <div className="callback-page">
      {isProcessing && <p>Processing your login...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
