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

export function searchAlbums(query, accessToken) {
  const encoded = encodeURIComponent(query)
  return callSpotifyApi(`/search?q=${encoded}&type=album&limit=10`, accessToken) //this part is limiting it to 10 albums
}

export function getCurrentUserProfile(accessToken) {
  return callSpotifyApi('/me', accessToken)
}
