
const months = [
    "Sept 2025", "Oct 2025", "Nov 2025", "Dec 2025",
    "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026",
    "May 2026", "June 2026", "July 2026", "Aug 2026",
    "Sept 2026", "Oct 2026", "Nov 2026"
];

// Actual image count in each folder
const imageCounts = {
    1: 2,
    2: 3,
    3: 4,
    4: 4,
    5: 5,
    6: 7,
    7: 10,
    8: 10,
    9: 10,
    10: 4,
    11: 11,
    12: 12,
    13: 7,
    14: 19,
    15: 9
};

/*
Folder structure:

assets/
    1/
        1.jpg
        2.jpg
    2/
        1.jpg
        2.jpg
        3.jpg
    ...
    15/
*/

// ==========================================
// CREATE MEMORIES DATA
// ==========================================

const memories = months.map((month, index) => {
    const folder = index + 1;

    const photos = Array.from(
        { length: imageCounts[folder] },
        (_, i) => ({
            src: `assets/${folder}/${i + 1}.jpg`,
            caption: ""
        })
    );

    return {
        month,
        cover: photos[0].src,
        photos
    };
});

// ==========================================
// DOM ELEMENTS
// ==========================================

const timelineNodes = document.getElementById("timelineNodes");
const timeline = document.getElementById("timeline");
const timelinePath = document.getElementById("timelinePath");
const timelineLine = document.getElementById("timelineLine");

const modal = document.getElementById("memoryModal");
const modalMonth = document.getElementById("modalMonth");
const carouselImage = document.getElementById("carouselImage");
const photoCaption = document.getElementById("photoCaption");
const photoCounter = document.getElementById("photoCounter");
const carouselDots = document.getElementById("carouselDots");

let currentMonth = 0;
let currentPhoto = 0;

// ==========================================
// CREATE TIMELINE NODES
// ==========================================

memories.forEach((memory, index) => {

    const node = document.createElement("div");
    node.className = "timeline-node";

    node.innerHTML = `
        <div class="polaroid">
            <img
                src="${memory.cover}"
                alt="${memory.month}"
                loading="lazy"
                onerror="this.src='https://placehold.co/400x400/ffe4e1/d6336c?text=${encodeURIComponent(memory.month)}"
            >

            <h3>${memory.month}</h3>
            <p>Click to revisit ♡</p>
        </div>
    `;

    node.addEventListener("click", () => openMonth(index));

    timelineNodes.appendChild(node);
});

// ==========================================
// DRAW CONNECTING TIMELINE PATH
// ==========================================

function drawTimeline() {

    const nodes = [
        ...timelineNodes.querySelectorAll(".timeline-node")
    ];

    if (!nodes.length || !timeline || !timelinePath || !timelineLine) {
        return;
    }

    const timelineRect = timeline.getBoundingClientRect();

    if (!timelineRect.width || !timelineRect.height) {
        return;
    }

    // Update SVG dimensions
    timelinePath.setAttribute(
        "viewBox",
        `0 0 ${timelineRect.width} ${timelineRect.height}`
    );

    timelinePath.setAttribute("width", timelineRect.width);
    timelinePath.setAttribute("height", timelineRect.height);

    // Get center coordinates of every polaroid
    const points = nodes.map(node => {

        const polaroid = node.querySelector(".polaroid");
        const rect = polaroid.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - timelineRect.left,
            y: rect.top + rect.height / 2 - timelineRect.top
        };
    });

    // Start path at first polaroid
    let path = `M ${points[0].x} ${points[0].y}`;

    // Connect all polaroids using smooth curves
    for (let i = 1; i < points.length; i++) {

        const previous = points[i - 1];
        const current = points[i];

        const middleY = (previous.y + current.y) / 2;

        path += `
            C ${previous.x} ${middleY},
              ${current.x} ${middleY},
              ${current.x} ${current.y}
        `;
    }

    timelineLine.setAttribute("d", path);
}

// ==========================================
// REFRESH TIMELINE AFTER LAYOUT
// ==========================================

function refreshTimeline() {

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {
            drawTimeline();
        });

    });
}

// ==========================================
// OPEN MONTH
// ==========================================

function openMonth(index) {

    currentMonth = index;
    currentPhoto = 0;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    modalMonth.textContent = memories[index].month;

    showPhoto();
}

// ==========================================
// DISPLAY PHOTO
// ==========================================

function showPhoto() {

    const memory = memories[currentMonth];
    const photo = memory.photos[currentPhoto];

    carouselImage.style.opacity = "0";

    const image = new Image();

    image.onload = () => {

        carouselImage.src = image.src;
        carouselImage.style.opacity = "1";

    };

    image.onerror = () => {

        carouselImage.src =
            `https://placehold.co/800x1000/ffe4e1/d6336c?text=${encodeURIComponent(
                memory.month + " Memory " + (currentPhoto + 1)
            )}`;

        carouselImage.style.opacity = "1";

    };

    image.src = photo.src;

    photoCaption.textContent =
        photo.caption || "A little moment to remember ♡";

    photoCounter.textContent =
        `${String(currentPhoto + 1).padStart(2, "0")} / ${String(memory.photos.length).padStart(2, "0")}`;

    // Create carousel dots
    carouselDots.innerHTML = "";

    memory.photos.forEach((_, index) => {

        const dot = document.createElement("button");

        dot.className = index === currentPhoto ? "active" : "";

        dot.setAttribute("aria-label", `Photo ${index + 1}`);

        dot.addEventListener("click", () => {

            currentPhoto = index;
            showPhoto();

        });

        carouselDots.appendChild(dot);

    });
}

// ==========================================
// PHOTO NAVIGATION
// ==========================================

function nextPhoto() {

    const length = memories[currentMonth].photos.length;

    currentPhoto = (currentPhoto + 1) % length;

    showPhoto();
}

function prevPhoto() {

    const length = memories[currentMonth].photos.length;

    currentPhoto = (currentPhoto - 1 + length) % length;

    showPhoto();
}

document.getElementById("nextPhoto")
    .addEventListener("click", nextPhoto);

document.getElementById("prevPhoto")
    .addEventListener("click", prevPhoto);

// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    modal.classList.remove("active");

    document.body.style.overflow = "";

}

document.getElementById("closeModal")
    .addEventListener("click", closeModal);

// Close when clicking outside
modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeModal();
    }

});

// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener("keydown", event => {

    if (!modal.classList.contains("active")) return;

    if (event.key === "Escape") {
        closeModal();
    }

    if (event.key === "ArrowRight") {
        nextPhoto();
    }

    if (event.key === "ArrowLeft") {
        prevPhoto();
    }

});

// ==========================================
// MOBILE SWIPE
// ==========================================

let touchStartX = 0;

modal.addEventListener("touchstart", event => {

    touchStartX = event.changedTouches[0].screenX;

}, { passive: true });

modal.addEventListener("touchend", event => {

    const difference =
        event.changedTouches[0].screenX - touchStartX;

    if (Math.abs(difference) < 50) return;

    if (difference < 0) {
        nextPhoto();
    } else {
        prevPhoto();
    }

}, { passive: true });

// ==========================================
// REDRAW TIMELINE
// ==========================================

// Initial drawing after layout
window.addEventListener("load", refreshTimeline);

// Redraw on window resize
window.addEventListener("resize", refreshTimeline);

// Observe timeline layout changes
if ("ResizeObserver" in window) {

    const timelineObserver = new ResizeObserver(refreshTimeline);

    timelineObserver.observe(timeline);
    timelineObserver.observe(timelineNodes);

}

// Initial refresh
refreshTimeline();
