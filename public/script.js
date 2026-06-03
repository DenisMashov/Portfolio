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

    // Disable on touch devices / mobile
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 992) return;

    // Create cursor elements
    const dot = document.createElement("div");
    const ring = document.createElement("div");

    dot.id = "cursor-dot";
    ring.id = "cursor-ring";

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // CSS for the cursor
    const style = document.createElement("style");
    style.textContent = `
        * { cursor: none !important; }

        /* dot */
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
            will-change: transform;
        }

        /* ring */
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
            will-change: transform;
        }

        /* hover effect */
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
    document.addEventListener("mousemove", e => {
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
        // Smooth ring following
        x += (mx - x) * 0.18;
        y += (my - y) * 0.18;

        // Dot follows mouse instantly
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        ring.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(animate);
    }
    animate();

    // Hover effect for interactive elements
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

    const style = document.createElement("style");
    style.textContent = `
        .reveal-anim{
            opacity:0;
            transform:translate3d(0,20px,0);
            transition:
                opacity .55s cubic-bezier(.16,1,.3,1),
                transform .55s cubic-bezier(.16,1,.3,1);
        }

        .reveal-anim.active{
            opacity:1;
            transform:translate3d(0,0,0);
        }

        @media (pointer: coarse) {
            .reveal-anim{
                opacity:1 !important;
                transform:none !important;
                transition:none !important;
            }
        }

        @media (prefers-reduced-motion: reduce){
            .reveal-anim{
                opacity:1 !important;
                transform:none !important;
                transition:none !important;
            }
        }
    `;
    document.head.appendChild(style);

    const elements = document.querySelectorAll(
        "section, .project, .card"
    );

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    elements.forEach(el => {
        el.classList.add("reveal-anim");
    });

    // Mobile = no animation
    if (isMobile) {
        elements.forEach(el => el.classList.add("active"));
        return;
    }

    // Fallback
    if (!("IntersectionObserver" in window)) {
        elements.forEach(el => el.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            entry.target.classList.add("active");
            obs.unobserve(entry.target);
        }
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.forEach(el => observer.observe(el));
});
