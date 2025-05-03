const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/now-playing', async (req, res) => {
  const username = 'Denis1337';
  const apiKey = process.env.LASTFM_API_KEY;

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const track = data.recenttracks.track[0];

    const nowPlaying = track['@attr']?.nowplaying === 'true';

    res.json({
      track: track.name,
      artist: track.artist['#text'],
      album: track.album['#text'],
      image: track.image.pop()['#text'],
      url: track.url,
      nowPlaying,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from Last.fm' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
