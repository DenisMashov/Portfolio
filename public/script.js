// ===============================
//  ANALYTICS
// ===============================
window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};

// ===============================
// TBILISI CLOCK
// ===============================
function updateClock() {
  const now = new Date();
  const tbilisi = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tbilisi" }));

  const hh = String(tbilisi.getHours()).padStart(2, "0");
  const mm = String(tbilisi.getMinutes()).padStart(2, "0");

  const el = document.getElementById("identity-clock");
  if (el) el.textContent = `${hh}:${mm} (GMT+4)`;
}

updateClock();
setInterval(updateClock, 1000);

// ===============================
// SPOTIFY / LANYARD
// ===============================
const userId = "385117340028764165";
let ws = null;
let start = null, end = null, duration = 0;

function connect() {
  ws = new WebSocket("wss://api.lanyard.rest/socket");
  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
  });
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
      const presence = data.d;

      // --- Spotify ---
      const card = document.getElementById("spotify-card");
      if (presence.spotify && presence.spotify.timestamps) {
        const s = presence.spotify;
        if (card) card.classList.remove("hidden");
        const art = document.getElementById("album-art");
        const song = document.getElementById("song-name");
        const artist = document.getElementById("artist-name");
        if (art) art.src = s.album_art_url;
        if (song) song.textContent = s.song;
        if (artist) artist.textContent = s.artist;
        start = s.timestamps.start;
        end = s.timestamps.end;
        duration = end - start;
        updateProgress();
      } else {
        if (card) card.classList.add("hidden");
      }

      // --- Discord Status ---
      const status = presence.discord_status;
      const dot = document.getElementById("avatar-dot");
      const displayStatus = (status === "offline") ? "offline" : "online";

      if (dot) {
        dot.className = `avatar-status-dot ${displayStatus}`;
        dot.title = displayStatus === "online" ? "Online" : "Offline";
      }
    }
  });
  ws.addEventListener("error", () => setTimeout(connect, 10000));
  ws.addEventListener("close", () => setTimeout(connect, 10000));
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && (!ws || ws.readyState !== WebSocket.OPEN)) {
    connect();
  }
});

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function updateProgress() {
  if (!start || !end || !duration) return;
  const elapsed = Date.now() - start;
  const pct = Math.min((elapsed / duration) * 100, 100);
  const bar = document.getElementById("progress-bar");
  const time = document.getElementById("time-display");
  if (bar) bar.style.width = pct + "%";
  if (time) time.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
  if (pct < 100) requestAnimationFrame(updateProgress);
}

connect();

// ===============================
// FADE IN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const elements = [
    document.querySelector(".topbar"),
    ...document.querySelectorAll(".section")
  ].filter(Boolean);

  elements.forEach(el => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.5s ease";
  });

  elements.forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = "1";
    }, 100 + i * 120);
  });
});
