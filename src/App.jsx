import { useEffect, useState } from 'react'
import {
  requestAuthorization,
  exchangeCodeForToken,
  searchAlbums,
  searchArtists,
  getTracks,
  sendToQueue,
} from './spotifyApi'
import './App.css'

function App() {
  const [accessToken, setAccessToken] = useState(() => window.localStorage.getItem('access_token') || '')
  const [albums, setAlbums] = useState([])
  const [albumIds, setAlbumIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('Daft Punk')
  const [totalAlbums, setTotalAlbums] = useState(0)
  const [artist, setArtist] = useState('')
  const [next, setNext] = useState(null)
  const [trackTest, setTrackTest] = useState(null)

  const clientId = import.meta.env.VITE_CLIENT_ID
  const redirectUri = 'https://spotify-tool.netlify.app/'

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (accessToken) return

    async function finishAuth() {
      if (code) {
        setLoading(true)
        setError(null)
        try {
          const token = await exchangeCodeForToken(code, clientId, redirectUri)
          setAccessToken(token)
          window.localStorage.setItem('access_token', token)
          window.history.replaceState({}, '', window.location.pathname)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
        return
      }

      if (!clientId) {
        setError('Missing Spotify client ID. Check your .env values.')
        return
      }
      await requestAuthorization(clientId, redirectUri)
    }

    finishAuth()
  }, [accessToken, clientId, redirectUri])

  useEffect(() => {
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
  }, [clientId, clientSecret])

  useEffect(() => {
    if (!accessToken || !artist) return

    async function loadAlbums() {
      setLoading(true)
      setError(null)

      try {
        const data = await searchAlbums(artist, accessToken)
        //console.log('Spotify album search results:', data) // Log the full response to debug
        const albumNames = data.items
        setAlbums(albumNames) 
        setTotalAlbums(data.total) 
        setAlbumIds(albumNames.map(album => album.id)) // Store album IDs for later use
        setNext(data.next) // Store the next URL for pagination
        //let nextVar = data.next
        // while (nextVar) {
        //   const nextData = await searchAlbums(artist, accessToken, albums.length) // Pass current offset
        //   setAlbums(prevAlbums => [...prevAlbums, ...nextData.items]) // Append new albums to existing list
        //   setTotalAlbums(nextData.total) // Update total albums count (should be the same)
        //   nextVar = nextData.next // Update nextVar for the next iteration
        // }
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
        //console.log('Spotify artist search results:', data.artists) // Log the full response to debug
        const artistName = data.artists.items[0].id
        setArtist(artistName) // Update to set artist name
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
        //console.log('Spotify album search results:', data) // Log the full response to debug
        const albumNames = data.items
        setAlbums(albumNames) 
        setTotalAlbums(data.total) 
        setAlbumIds(albumNames.map(album => album.id)) // Store album IDs for later use
        setNext(data.next) // Store the next URL for pagination
        //let nextVar = data.next
        // while (nextVar) {
        //   const nextData = await searchAlbums(artist, accessToken, albums.length) // Pass current offset
        //   setAlbums(prevAlbums => [...prevAlbums, ...nextData.items]) // Append new albums to existing list
        //   setTotalAlbums(nextData.total) // Update total albums count (should be the same)
        //   nextVar = nextData.next // Update nextVar for the next iteration
        // }
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

  const foo = localStorage.getItem('access_token'); // returns 'myValue'
  console.log('Access token from localStorage:', foo) // Log the retrieved access token for debugging


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
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <p>There are {totalAlbums} full length albums</p>
       <button >Add More</button>
      <ol>
        {albums.map((album) => (
          <li key={album.id}>
            {album.name}
          </li>
        ))}
      </ol>
      <button onClick={() => sendToQueue(trackTest, accessToken)}>Add to Queue</button>
    </main>
  )
}

export default App

export async function exchangeCodeForToken(code, clientId, redirectUri) {
  const codeVerifier = localStorage.getItem('code_verifier')
  if (!codeVerifier) throw new Error('Missing PKCE code verifier in localStorage.')

  const response = await fetch(SPOTIFY_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Spotify token exchange error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}
