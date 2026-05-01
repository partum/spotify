import { useEffect, useState } from 'react'
import { requestClientCredentialsToken, searchTracks } from './spotifyApi'
import './App.css'

function App() {
  // const [clientId, setClientId] = useState('') //import from .env
  // const [clientSecret, setClientSecret] = useState('') //import from .env
  const [accessToken, setAccessToken] = useState('')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clientId = import.meta.env.VITE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET

  useEffect(() => {
    async function init() {
      if (!clientId || !clientSecret) {
        setError('Missing Spotify client credentials. Check your .env values.')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const token = await requestClientCredentialsToken(clientId, clientSecret)
        setAccessToken(token)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [clientId, clientSecret])

  useEffect(() => {
    if (!accessToken) return

    async function loadTracks() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchTracks('Daft Punk', accessToken)
        setTracks(data.tracks.items)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTracks()
  }, [accessToken])

  return (
    <main className="app">
      <h1>Spotify Tool</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {tracks.map((track) => (
          <li key={track.id}>
            {track.name} — {track.artists.map((artist) => artist.name).join(', ')}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
