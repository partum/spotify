1. Set up Spotify authentication
Create a Spotify app in the Spotify Developer Dashboard. ✅
Configure a redirect URI for your app. ✅
Use Spotify’s OAuth flow for the browser.
Request the scopes needed for actions like:
- viewing profile data
- creating playlists
- adding tracks to playlists
- adding tracks to the queue
For this feature, public client-credentials auth is not enough for playlist/queue actions. You need user login.

2. Build the main user experience
Create three clear stages in the UI:

Search artist
View recent albums
Choose save action
Suggested UI elements:

Search box for artist name
Loading state while Spotify responds
Album cards or list with cover art, title, and release date
Buttons for “Add to playlist” and “Add to queue”

3. Fetch the artist and their albums
When the user submits an artist name:

Search Spotify for the artist.
Pick the best match.
Request that artist’s albums.
Sort the albums by release date, newest first.
Show the most recent 5–10 albums.
You may also want to filter out unwanted album types such as compilations or singles, depending on your product goal.

4. Let the user select albums
Display the albums in a list or grid.
Allow the user to select one or more albums.
Optionally let them choose:
all tracks from the album
only a subset of tracks
a custom playlist name

5. Implement the save actions
Create two action paths:

Save as playlist

Create a new playlist for the user
Add the selected album tracks to it
Optionally let the user name the playlist
Add to queue

Send the selected tracks to the user’s playback queue
Make sure the user has an active playback device

What is easiest to add to?
-queue [this barely works even via the Spotify interface]
-playlist
-library [this accepts album URIs] ⬅️

6. Handle errors and edge cases
Plan for:

No artist found
No albums found
User cancels login
No active device for queueing
API rate limits or temporary Spotify failures
Duplicate albums or tracks

7. Add polish
Good MVP improvements:

Show album art and release year
Add “loading”, “empty”, and “success” states
Let users save only a few albums instead of all
Support selecting albums one by one or in bulk

8. Suggested app structure
A clean structure would be:

Frontend UI for search and album display
Auth layer for Spotify login and token handling
Spotify service layer for artist search, album lookup, playlist creation, and queueing
State management for selected albums and saved results
Recommended MVP
If you want to keep the first version simple, build this first:

Artist search
Show recent albums
Let the user select albums
Add them to a new playlist
Then add “queue” as the second feature.

