import { useEffect, useState } from 'react'
import {
  requestClientCredentialsToken,
  searchAlbums,
  searchArtists,
  getTracks,
  sendToQueue,
  saveAlbumsToLibrary,
} from './spotifyApi'
import { redirectToAuthCodeFlow, checkTokenExpiration } from './loginScript'
import './App.css'
import AlbumList from './components/AlbumList'

function App() {
  const [accessToken, setAccessToken] = useState(() => window.localStorage.getItem('access_token') || '')
  const [userAccessToken, setUserAccessToken] = useState(() => window.localStorage.getItem('user_access_token') || '')
  const [albums, setAlbums] = useState([])
  const [albumIds, setAlbumIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('Daft Punk')
  const [saveStatus, setSaveStatus] = useState('')
  //const [totalAlbums, setTotalAlbums] = useState(0)
  const [artist, setArtist] = useState('')
  const [next, setNext] = useState(null)
  const [trackTest, setTrackTest] = useState(null)

  const clientId = import.meta.env.VITE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET
  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'https://spotify-tool.netlify.app/callback'

  useEffect(() => {
    if (!clientId || !clientSecret) {
      setError('Missing Spotify client credentials. Check your .env values.')
      return
    }

    let isMounted = true

    async function loadToken() {
      setLoading(true)
      setError(null)

      try {
        const token = await requestClientCredentialsToken(clientId, clientSecret)
        if (isMounted) {
          setAccessToken(token)
          window.localStorage.setItem('access_token', token)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadToken()

    return () => {
      isMounted = false
    }
  }, [clientId, clientSecret])

  // Token is loaded from localStorage on mount via useState initializer
  // CallbackPage handles the OAuth redirect and token exchange

  useEffect(() => {
    if (!accessToken || !artist) return

    async function loadAlbums() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchAlbums(artist, accessToken)
        const albumNames = data.items
        setAlbums(albumNames)
        //setTotalAlbums(data.total)
        setAlbumIds(albumNames.map(album => album.id)) // Store album IDs for later use
        setNext(data.next) // Store the next URL for pagination
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
  }, [artist, accessToken])

  useEffect(() => {
    if (!accessToken) return

    async function loadArtist() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchArtists(searchQuery, accessToken)
        const artistName = data.artists.items[0].id
        setArtist(artistName) 
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadArtist()
  }, [accessToken, searchQuery])

  function loadMoreAlbums() {
    if (!next) return // No more albums to load
  }

  useEffect(() => {
    if (!accessToken || !artist) return

    async function loadAlbums() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchAlbums(artist, accessToken)
        const albumNames = data.items
        setAlbums(albumNames)
        //setTotalAlbums(data.total)
        setAlbumIds(albumNames.map(album => album.id)) // Store album IDs for later use
        setNext(data.next) // Store the next URL for pagination
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
  }, [artist, accessToken])

  useEffect(() => {
    if (!accessToken || albumIds.length === 0) return

    async function loadTracks() {
      setLoading(true)
      setError(null)

      try {
        const data = await getTracks(albumIds[0], accessToken)
        console.log('Current album ID:', albumIds[0]) // Log the current album ID being fetched
        console.log('Spotify track search results:', data.items[0].id) // Log the full response to debug
        setTrackTest(data.items[0].id) // Update to set the first track, if available
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTracks()
  }, [albumIds, accessToken])

  async function handleLogin() {
    redirectToAuthCodeFlow(clientId)
  }

  async function handleSaveAlbums() {
    if (!userAccessToken) {
      setError('Please login with Spotify to save albums to your library.')
      return
    }

    if (albumIds.length === 0) {
      setError('No albums are loaded yet to save.')
      return
    }

    setLoading(true)
    setError(null)
    setSaveStatus('')

    try {
      await saveAlbumsToLibrary(albumIds, userAccessToken)
      setSaveStatus('Saved loaded albums to your Spotify library.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  checkTokenExpiration();

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
      </form>
      <AlbumList loading={loading} error={error} albums={albums} />

      {!userAccessToken ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <button onClick={handleSaveAlbums} disabled={albumIds.length === 0}>
          Save albums to library
        </button>
      )}


      {saveStatus && <p>{saveStatus}</p>}
    </main>
  )
}

export default App


