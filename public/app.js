const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userImg = document.getElementById('user-img');
const playlistsUl = document.getElementById('playlists');

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function getHashParams() {
  const hash = window.location.hash.substring(1);
  return hash
    ? JSON.parse('{"' + decodeURIComponent(hash).replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    : {};
}

const params = getHashParams();
let access_token = params.access_token || null;

if (access_token) {
  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
  userInfo.style.display = 'block';

  fetchUserProfile();
  fetchUserPlaylists();
} else {
  loginBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
  userInfo.style.display = 'none';
}

loginBtn.addEventListener('click', () => {
  window.location = '/login';
});

logoutBtn.addEventListener('click', () => {
  access_token = null;
  window.location.hash = '';
  loginBtn.style.display = 'inline-block';
  logoutBtn.style.display = 'none';
  userInfo.style.display = 'none';
  playlistsUl.innerHTML = '';
  userName.textContent = '';
  userImg.src = '';
});

function fetchUserProfile() {
  fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: 'Bearer ' + access_token }
  })
    .then(res => res.json())
    .then(data => {
      userName.textContent = data.display_name;
      userImg.src = data.images[0]?.url || '';
    });
}

function fetchUserPlaylists() {
  fetch(`${SPOTIFY_API_BASE}/me/playlists`, {
    headers: { Authorization: 'Bearer ' + access_token }
  })
    .then(res => res.json())
    .then(data => {
      playlistsUl.innerHTML = '';
      data.items.forEach(playlist => {
        const li = document.createElement('li');
        li.textContent = playlist.name;
        playlistsUl.appendChild(li);
      });
    });
}
