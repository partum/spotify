

function getRedirectUri() {
  return import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`
}

export async function handleCallbackRedirect() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const error = params.get('error')
  const clientId = import.meta.env.VITE_CLIENT_ID

  if (error) {
    throw new Error(`Spotify authorization failed: ${error}`)
  }

  if (!code || !clientId) return null

  const tokenResponse = await getAccessToken(clientId, code)
  window.history.replaceState({}, document.title, window.location.pathname)
  return tokenResponse
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", getRedirectUri());
    params.append("scope", "user-read-private user-read-email user-modify-playback-state user-library-modify");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}


export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem('verifier')

  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', getRedirectUri())
  params.append('code_verifier', verifier)

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  const response = await result.json()

  if (!result.ok) {
    const errorMessage = response.error_description || response.error || 'Failed to exchange token'
    throw new Error(errorMessage)
  }

  return response
}

export function storeUserTokens(tokenResponse) {
  if (!tokenResponse?.access_token) return

  window.localStorage.setItem('user_access_token', tokenResponse.access_token)

  if (tokenResponse.refresh_token) {
    window.localStorage.setItem('refresh_token', tokenResponse.refresh_token)
  }

  const expiresAt = Date.now() + Number(tokenResponse.expires_in || 0) * 1000
  window.localStorage.setItem('access_token_expires_at', String(expiresAt))
}

export function clearUserTokens() {
  window.localStorage.removeItem('user_access_token')
  window.localStorage.removeItem('refresh_token')
  window.localStorage.removeItem('access_token_expires_at')
  window.localStorage.removeItem('verifier')
}

export function isUserTokenExpired() {
  const expiresAt = Number(window.localStorage.getItem('access_token_expires_at'))
  return !expiresAt || Date.now() >= expiresAt
}

export async function refreshUserAccessToken() {
  const refreshToken = window.localStorage.getItem('refresh_token')
  const clientId = import.meta.env.VITE_CLIENT_ID

  if (!refreshToken || !clientId) {
    throw new Error('No refresh token available. Please log in again.')
  }

  const payload = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
  })

  const response = await result.json()

  if (!result.ok) {
    clearUserTokens()
    const errorMessage = response.error_description || response.error || 'Failed to refresh token'
    throw new Error(errorMessage)
  }

  storeUserTokens({
    access_token: response.access_token,
    refresh_token: response.refresh_token || refreshToken,
    expires_in: response.expires_in,
  })

  return response.access_token
}

export async function refreshUserTokenIfNeeded() {
  if (!window.localStorage.getItem('user_access_token')) {
    return null
  }

  if (!isUserTokenExpired()) {
    return window.localStorage.getItem('user_access_token')
  }

  return refreshUserAccessToken()
}

