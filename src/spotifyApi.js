const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'

export async function requestClientCredentialsToken(clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error('Client ID and Client Secret are required to request a Spotify token.')
  }

  const credentials = btoa(`${clientId}:${clientSecret}`)
  const response = await fetch(SPOTIFY_AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Spotify auth error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function callSpotifyApi(endpoint, accessToken, method = 'GET', body = null) {
  if (!accessToken) {
    throw new Error('Missing Spotify access token. Request a token using client credentials before calling the Spotify API.')
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export function searchAlbums(artistID, accessToken) {
  const encoded = encodeURIComponent(artistID)
  return callSpotifyApi(`/artists/${encoded}/albums?offset=0&limit=10&locale=en-US,en;q%3D0.9&include_groups=album`, accessToken) //does this include EPs?
}

export function searchArtists(query, accessToken) {
  const encoded = encodeURIComponent(query)
  return callSpotifyApi(`/search?q=${encoded}&type=artist&offset=0`, accessToken)
}

export function getTracks(albumID, accessToken) {
  const encoded = encodeURIComponent(albumID)
  return callSpotifyApi(`/albums/${encoded}/tracks?offset=0&limit=20`, accessToken)
}

export function sendToQueue(trackId, accessToken) {
  const encoded = encodeURIComponent(trackId)
  return callSpotifyApi(`/me/player/queue?uri=spotify%3Atrack%3A${encoded}`, accessToken, 'POST')

}

export function getCurrentUserProfile(accessToken) {
  return callSpotifyApi('/me', accessToken)
}







