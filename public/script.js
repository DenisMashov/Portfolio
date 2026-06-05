// ===============================
//  ANALYTICS
// ===============================
// Load Vercel Analytics
(function () {
  const script = document.createElement("script");
  script.src = "https://va.vercel-scripts.com/v1/script.js";
  script.defer = true;
  document.head.appendChild(script);
})();

// Setup event tracking queue
window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};

//  event
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("#signupBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      va("event", {
        name: "signup_click",
        data: { source: "homepage" }
      });
    });
  }
});

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
// SCROLL REVEAL ANIMATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    // Insert CSS for animation
    const style = document.createElement("style");
    style.textContent = `
        /* SEO fallback: elements visible if JS disabled */
        .reveal { opacity:1; transform:none; }

        /* animated state */
        .reveal-anim {
            opacity:0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
            will-change: opacity, transform;
        }

        /* when active */
        .reveal-anim.active {
            opacity:1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Select only important elements
    const elements = document.querySelectorAll("section, .project, .card");

    // Apply reveal-anim class to all selected elements
    elements.forEach(el => {
        el.classList.add("reveal-anim");
    });

    // If IntersectionObserver not supported → show everything
    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("active"));
        return;
    }

    // Create one observer for all elements
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                obs.unobserve(entry.target); // stop observing for better performance
            }
        });
    }, {
        threshold: 0.15,           // element is 15% visible before triggering
        rootMargin: "0px 0px -50px 0px"
    });

    // Observe all elements
    elements.forEach(el => observer.observe(el));
});
