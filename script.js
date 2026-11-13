/**
 * 1. Asset Configuration Array
 */
const assetConfig = [
    { 
        path: 'assets/element-1.png', 
        instances: 3, 
        minSize: 40, maxSize: 90, 
        minOpacity: 0.6, maxOpacity: 0.9, 
        rotationSpeed: 0.05 
    },
    { 
        path: 'assets/element-2.png', 
        instances: 2, 
        minSize: 30, maxSize: 70, 
        minOpacity: 0.5, maxOpacity: 0.8, 
        rotationSpeed: -0.05 
    },
    { 
        path: 'assets/element-3.png', 
        instances: 2, 
        minSize: 50, maxSize: 100, 
        minOpacity: 0.7, maxOpacity: 1.0, 
        rotationSpeed: 0.03 
    },
    { 
        path: 'assets/element-4.png', 
        instances: 2, 
        minSize: 50, maxSize: 100, 
        minOpacity: 0.7, maxOpacity: 1.0, 
        rotationSpeed: 0.03 
    },
    { 
        path: 'assets/element-5.png', 
        instances: 2, 
        minSize: 50, maxSize: 100, 
        minOpacity: 0.7, maxOpacity: 1.0, 
        rotationSpeed: 0.03 
    },
    { 
        path: 'assets/element-6.png', 
        instances: 2, 
        minSize: 50, maxSize: 100, 
        minOpacity: 0.7, maxOpacity: 1.0, 
        rotationSpeed: 0.03 
    }
];
class FloatingElement {
    constructor(config, initialX, initialY) {
        this.container = document.getElementById('ambient-background');
        
        this.el = document.createElement('div');
        this.el.className = 'ambient-element';
        
        const img = document.createElement('img');
        img.src = config.path;
        img.alt = ""; 
        
        img.onerror = () => {
            this.el.style.display = 'none';
        };

        this.el.appendChild(img);
        this.container.appendChild(this.el);

        this.size = this.random(config.minSize, config.maxSize);
        this.radius = this.size / 2;
        
        this.el.style.width = `${this.size}px`;
        this.el.style.height = `${this.size}px`;
        this.el.style.opacity = this.random(config.minOpacity, config.maxOpacity);

        // 2D GRID DISPERSION: Places elements exactly in their assigned grid cell
        this.x = initialX + this.random(-20, 20); 
        this.y = initialY + this.random(-20, 20);
        
        this.baseVy = this.random(-0.6, -0.2); 
        this.vy = this.baseVy;
        
        this.vx = this.random(-0.2, 0.2);
        this.targetVx = this.vx;
        
        this.rotation = this.random(0, 360);
        this.vRot = config.rotationSpeed * this.random(0.5, 1.2);
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    update(allElements) {
        allElements.forEach(other => {
            if (other === this) return;

            let c1x = this.x + this.radius;
            let c1y = this.y + this.radius;
            let c2x = other.x + other.radius;
            let c2y = other.y + other.radius;

            let dx = c1x - c2x;
            let dy = c1y - c2y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            let minDistance = this.radius + other.radius + 50; 

            if (distance < minDistance && distance > 0) {
                let overlap = minDistance - distance;
                let pushFactor = overlap * 0.003;

                this.vx += (dx / distance) * pushFactor;
                this.vy += (dy / distance) * pushFactor;
            }
        });

        if (Math.random() < 0.01) {
            this.targetVx = this.random(-0.3, 0.3);
        }

        if (this.x < -150) this.x = window.innerWidth + 100;
        if (this.x > window.innerWidth + 150) this.x = -100;

        this.vx += (this.targetVx - this.vx) * 0.02;
        this.vy += (this.baseVy - this.vy) * 0.02; 

        this.vx = Math.max(-1.5, Math.min(1.5, this.vx));
        this.vy = Math.max(-1.5, Math.min(0.2, this.vy));

        this.x += this.vx;
        this.y += this.vy; 
        this.rotation += this.vRot;

        if (this.y < -150) {
            this.y = window.innerHeight + 150; 
            
            let newX = this.random(0, window.innerWidth);
            let attempts = 0;
            let spaceIsClear = false;
            
            while (!spaceIsClear && attempts < 10) {
                newX = this.random(0, window.innerWidth);
                spaceIsClear = true;
                
                for (let other of allElements) {
                    if (other === this) continue;
                    if (other.y > window.innerHeight - 200) {
                        if (Math.abs(other.x - newX) < 150) {
                            spaceIsClear = false;
                            break; 
                        }
                    }
                }
                attempts++;
            }
            
            this.x = newX;
            this.vy = this.baseVy; 
        }

        this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }
}

// Initialization and Animation Loop
let activeElements = [];

function initBackground() {
    let totalElements = 0;
    assetConfig.forEach(config => totalElements += config.instances);

    // Create a dynamic 2D grid based on screen size and element count
    let ratio = window.innerWidth / window.innerHeight;
    let cols = Math.ceil(Math.sqrt(totalElements * ratio));
    let rows = Math.ceil(totalElements / cols);
    
    let cellWidth = window.innerWidth / cols;
    let cellHeight = window.innerHeight / rows;

    // Build an array of grid slots and shuffle them so element types are randomly distributed
    let slots = [];
    for (let i = 0; i < cols * rows; i++) {
        slots.push(i);
    }
    slots.sort(() => Math.random() - 0.5);

    let currentSlotIndex = 0;

    assetConfig.forEach(config => {
        for (let i = 0; i < config.instances; i++) {
            let slot = slots[currentSlotIndex];
            let col = slot % cols;
            let row = Math.floor(slot / cols);
            
            // Calculate precise center of this specific grid cell
            let initialX = (col * cellWidth) + (cellWidth / 2) - 30;
            let initialY = (row * cellHeight) + (cellHeight / 2) - 30;

            activeElements.push(new FloatingElement(config, initialX, initialY));
            currentSlotIndex++;
        }
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        requestAnimationFrame(animateBackground);
    } else {
        activeElements.forEach(el => el.update(activeElements));
    }
}

function animateBackground() {
    activeElements.forEach(el => el.update(activeElements));
    requestAnimationFrame(animateBackground);
}


/**
 * 3. Envelope Interaction, Emoji Burst & Full Screen Letter
 */
const envelope = document.getElementById('envelope');
const letterOverlay = document.getElementById('letter-overlay');
const closeBtn = document.getElementById('close-letter');

function createEmojiBurst() {
    const emojis = ['🎉', '💖', '✨', '🌸', '🎂', '🎊'];
    const burstCount = 40; 
    
    const rect = envelope.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    for (let i = 0; i < burstCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'emoji-particle';
        particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2; 
        const distance = 80 + Math.random() * 200; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = (Math.random() - 0.5) * 720; 

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

envelope.addEventListener('click', () => {
    if (!envelope.classList.contains('is-open')) {
        envelope.classList.add('is-open');
        createEmojiBurst();
        
        setTimeout(() => {
            letterOverlay.classList.add('is-visible');
        }, 1500); 
    } else {
        letterOverlay.classList.add('is-visible');
    }
});

closeBtn.addEventListener('click', () => {
    letterOverlay.classList.remove('is-visible');
});

document.addEventListener('DOMContentLoaded', initBackground);


/**
 * 4. Letter Buttons Interaction
 */
const btnMemories = document.getElementById('btn-memories');
const btnQuiz = document.getElementById('btn-quiz');

btnMemories.addEventListener('click', () => {
    // Change 'memories.html' to the actual name of your new page
    window.location.href = 'memories.html'; 
});

btnQuiz.addEventListener('click', () => {
    // Add your logic here to start the love quiz
    console.log("Love Quiz clicked!");
    // Example: quizModal.classList.add('is-visible');
});