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
//  MINIMAL CURSOR
// ===============================
const cursor = document.createElement("div");
cursor.id = "cursor";

document.body.appendChild(cursor);

const style = document.createElement("style");
style.textContent = `
    *{
        cursor:none !important;
    }

    #cursor{
        position:fixed;
        width:24px;
        height:24px;
        pointer-events:none;
        z-index:999999;
        transform:translate(-2px,-2px);
        transition:transform .08s ease;
        filter:
            drop-shadow(0 2px 4px rgba(0,0,0,.18))
            drop-shadow(0 0 1px rgba(255,255,255,.4));
    }

    #cursor svg{
        width:100%;
        height:100%;
        display:block;
    }

    .cursor-hover #cursor{
        transform:translate(-2px,-2px) scale(1.08);
    }
`;
document.head.appendChild(style);

cursor.innerHTML = `
<svg viewBox="0 0 24 24" fill="none">
    <path
        d="M4 2L18 14L11.5 15.5L14.5 22L11.5 23L8.5 16.5L4 20V2Z"
        fill="white"
        stroke="#111827"
        stroke-width="1.2"
        stroke-linejoin="round"
    />
</svg>
`;

document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

document
    .querySelectorAll("a,button,input,textarea")
    .forEach(el => {
        el.addEventListener("mouseenter", () =>
            document.body.classList.add("cursor-hover")
        );

        el.addEventListener("mouseleave", () =>
            document.body.classList.remove("cursor-hover")
        );
    });

// ===============================
// ANIMATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    // Only add animation styles once
    const style = document.createElement("style");
    style.textContent = `
        .reveal{
            opacity:1; /* fallback = SEO + no JS safety */
            transform:none;
        }

        .reveal-anim{
            opacity:0;
            transform:translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            will-change: opacity, transform;
        }

        .reveal-anim.active{
            opacity:1;
            transform:translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Select ONLY important elements 
    const elements = document.querySelectorAll(
        "section, .project, .card"
    );

    elements.forEach(el => {
        el.classList.add("reveal-anim");
    });

    // If browser doesn't support IntersectionObserver → show everything
    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                obs.unobserve(entry.target); // important: runs once only
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(el => observer.observe(el));
});
