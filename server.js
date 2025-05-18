// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const client_id = '0e1da93a99784520a2abdc19508f63e7';        // <-- Replace with your Spotify Client ID
const client_secret = '86e8fd1129f84ba89e11ab3a3c57e7b4';// <-- Replace with your Spotify Client Secret
const redirect_uri = 'http://127.0.0.1:5500/index.html';

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i=0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const stateKey = 'spotify_auth_state';

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email streaming';
  const authQueryParameters = new URLSearchParams({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
    state,
  });
  res.redirect('https://accounts.spotify.com/authorize?' + authQueryParameters.toString());
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }).toString(),
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Redirect to frontend (adjust if frontend runs elsewhere)
    res.redirect(`http://localhost:5500/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (err) {
    res.status(400).send(err.response?.data || err.message);
  }
});

app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }).toString(),
    });
    res.json({ access_token: response.data.access_token });
  } catch (err) {
    res.status(400).send(err.response?.data || err.message);
  }
});

app.listen(3000, () => {
  console.log('Backend server listening on http://localhost:3000');
});
