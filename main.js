// Declare.......
const title = document.getElementById("title");
const description = document.getElementById("description");
const dotsContainer = document.getElementById("dots");
const container = document.querySelector(".coverflow-container");
const items = document.querySelectorAll(".coverflow-item");
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

let currentItem = 0;
let isAnimation = false;

// Array Data.......
const imgData = [
    {
        title: "Mountain Landscape",
        description: "Majestic peaks covered in snow during golden hour"
    },
    {
        title: "Forest Path",
        description: "A winding trail through ancient woodland"
    },
    {
        title: "Ocean Sunset",
        description: "Golden hour at the beach with waves crashing"
    },
    {
        title: "Rolling Sand Dunes",
        description: "Wind-swept dunes under a clear blue sky"
    },
    {
        title: "Serene Water",
        description: "Calm lake reflecting the surrounding mountains"
    },
    {
        title: "Starry Night",
        description: "A breathtaking view of the Milky Way"
    },
    {
        title: "Waterfall",
        description: "Cascading water through lush green forest"
    }
]

// Create Dots.......
items.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.onclick = () => goToIndex(index);
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');
let autoplayInterval = null;
let isPlaying = true;


function updateCoverflow() {
    if (isAnimation) return;
    isAnimation = true;

    items.forEach((item, index) => {
        let offset = index - currentItem;

        if (offset > items.length / 2) {
            offset = offset - items.length;
        }
        else if (offset < -items.length / 2) {
            offset = offset + items.length;
        }

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);

        let translateX = offset * 220;
        let translateZ = -absOffset * 200;
        let rotateY = -sign * Math.min(absOffset * 60, 60);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.1);

        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 800;
        }

        item.style.transform = `
        translateX(${translateX}px) 
        translateZ(${translateZ}px) 
        rotateY(${rotateY}deg)
        scale(${scale})
        `;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        item.classList.toggle('active', index === currentItem);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentItem);
    });

    const currentData = imgData[currentItem];
    title.textContent = currentData.title;
    description.textContent = currentData.description;

    title.style.animation = 'none';
    description.style.animation = 'none';
    setTimeout(() => {
        title.style.animation = 'fadeIn 0.6s forwards';
        description.style.animation = 'fadeIn 0.6s forwards';
    }, 1000);

    setTimeout(() => {
        isAnimation = false;
    }, 600);
}

function navigate(direction) {
    if (isAnimation) return;

    currentItem = currentItem + direction;

    if (currentItem < 0) {
        currentItem = items.length - 1;
    } else if (currentItem >= items.length) {
        currentItem = 0;
    }

    updateCoverflow();
}

function goToIndex(index) {
    if (isAnimation || index === currentItem) return;
    currentItem = index;
    updateCoverflow();
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
});

// Click on items to select
items.forEach((item, index) => {
    item.addEventListener('click', () => goToIndex(index));
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;

container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isSwiping = true;
}, { passive: true });

container.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;

    const currentX = e.changedTouches[0].screenX;
    const diff = currentX - touchStartX;

    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}, { passive: false });

container.addEventListener('touchend', (e) => {
    if (!isSwiping) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
    isSwiping = false;
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 30;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        handleUserInteraction();

        if (diffX > 0) {
            navigate(1);
        } else {
            navigate(-1);
        }
    }
}

// Initialize images and reflections
items.forEach((item, index) => {
    const img = item.querySelector('img');
    const reflection = item.querySelector('.reflection');

    img.onload = function () {
        this.parentElement.classList.remove('image-loading');
        reflection.style.setProperty('--bg-image', `url(${this.src})`);
        reflection.style.backgroundImage = `url(${this.src})`;
        reflection.style.backgroundSize = 'cover';
        reflection.style.backgroundPosition = 'center';
    };

    img.onerror = function () {
        this.parentElement.classList.add('image-loading');
    };
});

// Autoplay functionality
function startAutoplay() {
    autoplayInterval = setInterval(() => {
        currentItem = (currentItem + 1) % items.length;
        updateCoverflow();
    }, 4000);
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
}

function toggleAutoplay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function handleUserInteraction() {
    stopAutoplay();
}


// Add event listeners to stop autoplay on manual navigation
items.forEach((item) => {
    item.addEventListener('click', handleUserInteraction);
});

document.querySelector('.nav-button.left').addEventListener('click', () => {
    handleUserInteraction();
    navigate(-1)
});
document.querySelector('.nav-button.right').addEventListener('click', () => {
    handleUserInteraction();
    navigate(1)
});

dots.forEach((dot) => {
    dot.addEventListener('click', handleUserInteraction);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        handleUserInteraction();
    }
});


//  update nav with container
const sections = document.querySelectorAll('.section')
const header = document.getElementById("header")
const menuItems = document.querySelectorAll('.menu-item')
const scrollToTopBtn = document.getElementById('scrollToTop')

function updateActiveMenuItem() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            menuItems.forEach(item => {
                if (!item.classList.contains('external')) {
                    item.classList.remove('active');
                }
            });
            if (menuItems[index] && !menuItems[index].classList.contains('external')) {
                menuItems[index].classList.add('active');
            }
        }
    });

    // Header background on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Show/hide scroll to top button
    if (window.scrollY > 500) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

window.addEventListener('scroll', updateActiveMenuItem);


//  Scroll To Top 
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
})


//  Form Submit 
function handleSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We\'ll get back to you soon.');
    event.target.reset();
}


// Initialize
updateCoverflow();
container.focus();
startAutoplay();

