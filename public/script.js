// ===============================
// LIGHT MODE TOGGLE 
// ===============================
function toggleMode() {
    const errorBox = document.getElementById("error-message");

    // show message
    errorBox.style.display = "block";

    // redirect after delay (prank)
    setTimeout(() => {
        window.location.href = "https://youtu.be/iuy9HX7FIoI";
    }, 1500);
}


// ===============================
// SPOTIFY / LANYARD WIDGET
// ===============================
const userId = "385117340028764165";

let ws = null;
let start = null;
let end = null;
let duration = 0;
let lastUpdateTime = Date.now();

function connect() {
    ws = new WebSocket("wss://api.lanyard.rest/socket");

    ws.addEventListener("open", () => {
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: userId }
        }));
    });

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
            const presence = data.d;

            if (presence.spotify && presence.spotify.timestamps) {
                const spotify = presence.spotify;

                document.getElementById("spotify-widget").classList.remove("hidden");
                document.getElementById("status-message").textContent = "";

                document.getElementById("album-art").src = spotify.album_art_url;
                document.getElementById("song-name").textContent = spotify.song;
                document.getElementById("artist-name").textContent = spotify.artist;

                start = spotify.timestamps.start;
                end = spotify.timestamps.end;
                duration = end - start;

                lastUpdateTime = Date.now();
                updateProgress();
            } else {
                hideWidget("");
            }
        }
    });

    ws.addEventListener("error", (err) => {
        console.error("WebSocket error:", err);
        setTimeout(connect, 10000);
    });

    ws.addEventListener("close", () => {
        console.warn("WebSocket closed. Reconnecting...");
        setTimeout(connect, 10000);
    });
}


// reconnect when user returns to tab
document.addEventListener("visibilitychange", () => {
    if (
        document.visibilityState === "visible" &&
        (!ws || ws.readyState !== WebSocket.OPEN)
    ) {
        connect();
    }
});


// ===============================
// SPOTIFY HELPERS
// ===============================
function hideWidget(message) {
    document.getElementById("spotify-widget").classList.add("hidden");
    document.getElementById("status-message").textContent = message;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function updateProgress() {
    if (!start || !end || !duration) return;

    const now = Date.now();
    const elapsed = now - start;
    const percent = Math.min((elapsed / duration) * 100, 100);

    const progressBar = document.getElementById("progress-bar");
    const timeDisplay = document.getElementById("time-display");

    if (progressBar) {
        progressBar.style.width = percent + "%";
    }

    if (timeDisplay) {
        timeDisplay.textContent =
            `${formatTime(elapsed)} / ${formatTime(duration)}`;
    }

    if (percent < 100) {
        lastUpdateTime = now;
        requestAnimationFrame(updateProgress);
    }
}


// ===============================
// START CONNECTION
// ===============================
connect();

// ===============================
// CURSOR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.createElement("div");
    cursor.id = "cursor";
    document.body.appendChild(cursor);

    const style = document.createElement("style");
    style.textContent = `
        #cursor{
            position:fixed;
            width:14px;
            height:14px;
            border-radius:50%;
            background:#7c3aed;
            pointer-events:none;
            z-index:999999;
            transform:translate(-50%,-50%);
            transition: width .15s ease, height .15s ease;
            box-shadow:
                0 0 10px #7c3aed,
                0 0 25px #06b6d4;
        }

        #cursor::after{
            content:"";
            position:absolute;
            top:50%;
            left:50%;
            width:45px;
            height:45px;
            transform:translate(-50%,-50%);
            border-radius:50%;
            background:rgba(124,58,237,0.12);
            border:1px solid rgba(6,182,212,0.25);
            filter:blur(1px);
        }
    `;
    document.head.appendChild(style);

    document.documentElement.style.cursor = "none";

    let x = 0, y = 0;
    let mx = 0, my = 0;

    document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animate(){
        x += (mx - x) * 0.18;
        y += (my - y) * 0.18;

        cursor.style.left = x + "px";
        cursor.style.top = y + "px";

        requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener("mousedown", () => {
        cursor.style.width = "10px";
        cursor.style.height = "10px";
    });

    document.addEventListener("mouseup", () => {
        cursor.style.width = "14px";
        cursor.style.height = "14px";
    });

    document.querySelectorAll("a, button").forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursor.style.width = "28px";
            cursor.style.height = "28px";
        });

        el.addEventListener("mouseleave", () => {
            cursor.style.width = "14px";
            cursor.style.height = "14px";
        });
    });
});
