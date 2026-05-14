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

/////Authorization Code with PKCE Flow/////
//Code Verifier
  const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
const codeVerifier  = generateRandomString(64);
//Code Challenge
const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}
const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
const hashed = await sha256(codeVerifier)
const codeChallenge = base64encode(hashed);


export function requestAuthorization() {
  //request user authorization
const clientId = import.meta.env.VITE_CLIENT_ID
const redirectUri = 'https://spotify-tool.netlify.app/' 

const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")

// generated in the previous step
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  {
  response_type: 'code',
  client_id: clientId,
  scope,
  code_challenge_method: 'S256',
  code_challenge: codeChallenge,
  redirect_uri: redirectUri,
}

authUrl.search = new URLSearchParams(params).toString();
window.location.href = authUrl.toString();
//response
const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');
//request access token
const getToken = async code => {

  // stored in the previous step
  const codeVerifier = localStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(url, payload);
  const response = await body.json();

  localStorage.setItem('access_token', response.access_token);
}
}





