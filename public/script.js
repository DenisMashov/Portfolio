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
// MINIMAL PREMIUM CURSOR
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    // disable on mobile / touch devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Create cursor elements
    const dot = document.createElement("div");
    const ring = document.createElement("div");

    dot.id = "cursor-dot";
    ring.id = "cursor-ring";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Insert optimized CSS
    const style = document.createElement("style");
    style.textContent = `
        * {
            cursor: none !important;
        }

        #cursor-dot {
            position: fixed;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999999;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            transition: background 0.15s ease;
        }

        #cursor-ring {
            position: fixed;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999998;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(59,130,246,0.6);
            transition: width 0.12s ease, height 0.12s ease, border-color 0.12s ease;
        }

        .cursor-hover #cursor-ring {
            width: 34px;
            height: 34px;
            border-color: rgba(6,182,212,0.8);
        }
    `;
    document.head.appendChild(style);

    // Cursor positions
    let mx = 0, my = 0; // real mouse
    let x = 0, y = 0;   // ring smooth position

    let hasMoved = false;

    // Mouse move listener
    document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;

        if (!hasMoved) {
            x = mx;
            y = my;
            hasMoved = true;
        }
    });

    // Animation loop
    function animate() {
        // smooth interpolation
        x += (mx - x) * 0.22;
        y += (my - y) * 0.22;

        dot.style.left = x + "px";
        dot.style.top = y + "px";

        ring.style.left = x + "px";
        ring.style.top = y + "px";

        requestAnimationFrame(animate);
    }
    animate();

    // Add hover effect only to interactive elements
    const hoverTargets = document.querySelectorAll("a, button, input, textarea");

    hoverTargets.forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
});



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

// --- Create loader ---
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // --- Create loader ---
  const loader = Object.assign(document.createElement('div'), {
    id: 'loader',
    innerHTML: `
      <div style="
        width:60px;height:60px;
        border:6px solid rgba(255,255,255,0.2);
        border-top:6px solid #38bdf8;
        border-radius:50%;
        animation:spin 1s linear infinite;
      "></div>
      <div style="margin-top:15px;font-family:Arial,sans-serif;font-size:18px;">
        Loading...
      </div>`
  });

  Object.assign(loader.style, {
    position: 'fixed',
    inset: '0',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: '9999',
    color: 'white'
  });

  document.body.appendChild(loader);

  // Spinner animation
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  // --- Remove loader after 4 seconds ---
  setTimeout(() => loader.remove(), 4000);
});
