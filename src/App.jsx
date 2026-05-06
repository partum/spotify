import { useEffect, useState } from 'react'
import { requestClientCredentialsToken, searchAlbums } from './spotifyApi'
import './App.css'

function App() {
  // const [clientId, setClientId] = useState('') //import from .env
  // const [clientSecret, setClientSecret] = useState('') //import from .env
  const [accessToken, setAccessToken] = useState('')
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('Daft Punk') // Default search query
  const [totalAlbums, setTotalAlbums] = useState(0) // State to hold total albums count

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

    async function loadAlbums() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchAlbums(searchQuery, accessToken)
        console.log('Spotify search results:', data.artists) // Log the full response to debug
        const albumNames = data.albums.items
        setAlbums(albumNames) // Update to set album names instead of albums
        setTotalAlbums(data.albums.total) // Update total albums count
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
  }, [accessToken, searchQuery])

  return (
    <main className="app">
      <h1>Spotify Tool</h1>
      <form onSubmit={(e) => e.preventDefault()}>
         <input 
          type="text" 
          placeholder="Enter artist name..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <p>There are {totalAlbums} total albums</p>
      <ol>
        {albums.map((album) => (
          <li key={album.id}>
            {album.name}
          </li>
        ))}
      </ol>
    </main>
  )
}

export default App
