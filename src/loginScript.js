

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

//check for expiration
export async function checkTokenExpiration() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const clientId = import.meta.env.VITE_CLIENT_ID;

    if (!code || !clientId) return null;

    const accessToken = await getAccessToken(clientId, code);
    const expiresAt = Date.now() + accessToken.expires_in * 1000; // Convert expires_in to milliseconds
    if (Date.now() >= expiresAt) {
        console.log("Access token has expired. Redirecting to login...");
}}

