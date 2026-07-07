import { useEffect } from 'react';
export default function TokenRefresh() {
    //get refresh
useEffect(() => {
    const getRefreshToken = async () => { 

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
    //set interval for refresh (in milliseconds)
    const intervalId = setInterval(getRefreshToken, 3600000);
    // 3. Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
}, []);
}