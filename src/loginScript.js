const redirectUri = `${window.location.origin}/callback`;

export async function handleCallbackRedirect() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const clientId = import.meta.env.VITE_CLIENT_ID;

    if (!code || !clientId) return null;

    const accessToken = await getAccessToken(clientId, code);
    window.history.replaceState({}, document.title, window.location.pathname);
    return accessToken;
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
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
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token; 
}

  const getRefreshToken = async () => { //i think I need to check if the token is expired

   // refresh token that has been previously stored
   const refreshToken = localStorage.getItem('refresh_token');
   const url = "https://accounts.spotify.com/api/token";

   const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
   }
   const result = await fetch(url, payload);
   const response = await result.json();

   if (!result.ok) {
     if (response.error === 'invalid_grant') {
       localStorage.removeItem('access_token');
       localStorage.removeItem('refresh_token');
       window.location.href = '/login';
       return;
     }

     throw new Error(`Token refresh failed: ${response.error}`);
   }

   localStorage.setItem('access_token', response.access_token);
   if (response.refresh_token) {
     localStorage.setItem('refresh_token', response.refresh_token);
   }
  }