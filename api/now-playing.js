const axios = require('axios');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const USER_NAME = 'Denis1337';

module.exports = async (req, res) => {
    try {
        const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'user.getRecentTracks',
                user: USER_NAME,
                api_key: LASTFM_API_KEY,
                limit: 1,
                extended: 1,
                format: 'json'
            }
        });

        const track = response.data.recenttracks.track[0];

        if (track['@attr'] && track['@attr'].nowplaying) {
            const songInfo = {
                name: track.name,
                artist: track.artist['#text'],
                album: track.album['#text'],
                image: track.image[2]['#text'],
                url: track.url
            };

            // Sending HTML response
            res.status(200).send(`
                <html>
                    <head>
                        <title>Now Playing</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 20px;
                            }
                            .song-info {
                                border: 1px solid #ccc;
                                padding: 20px;
                                margin-top: 20px;
                                border-radius: 10px;
                                background-color: #f4f4f4;
                            }
                            .song-info img {
                                max-width: 200px;
                                margin-bottom: 15px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Now Playing</h1>
                        <div class="song-info">
                            <h2>${songInfo.name} by ${songInfo.artist}</h2>
                            <p><strong>Album:</strong> ${songInfo.album}</p>
                            <img src="${songInfo.image}" alt="${songInfo.name}">
                            <p><a href="${songInfo.url}" target="_blank">Listen on Last.fm</a></p>
                        </div>
                    </body>
                </html>
            `);
        } else {
            res.status(200).send(`
                <html>
                    <body>
                        <h1>No song is currently playing.</h1>
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching current track from Last.fm.');
    }
};
