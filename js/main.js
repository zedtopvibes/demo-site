// ===== Zedtopvibes.com - Main JavaScript =====
// NO API CONTENT - Just core functionality with universal Coming Soon

let currentPage = 1;
let currentSearchTerm = '';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeaderAndFooter();
    
    // Initialize components that don't depend on header
    initializeScrollButton();
    initializeLiveSearch();
    
    // Show coming soon in all empty containers
    setTimeout(showComingSoon, 200); // Small delay for header to load
});

// ===== UNIVERSAL COMING SOON =====
function showComingSoon() {
    // Get ALL empty containers on the page (any element with ID ending in "-container")
    const containers = document.querySelectorAll('[id$="-container"]');
    
    containers.forEach(container => {
        // Only add coming soon if container is empty
        if (container && container.children.length === 0) {
            container.innerHTML = getComingSoonHTML(container.id);
        }
    });
}

function getComingSoonHTML(containerId) {
    // Default values
    let message = 'Coming Soon';
    let icon = '🎵';
    
    // Determine content based on container ID
    if (containerId.includes('trending')) {
        message = 'Trending Tracks';
        icon = '🔥';
    } else if (containerId.includes('latest')) {
        message = 'Latest Releases';
        icon = '🆕';
    } else if (containerId.includes('playlist')) {
        message = 'Playlists';
        icon = '📋';
    } else if (containerId.includes('album')) {
        message = 'Albums';
        icon = '💿';
    } else if (containerId.includes('eps')) {
        message = 'EPs';
        icon = '🎼';
    } else if (containerId.includes('artist')) {
        message = 'Artists';
        icon = '🎤';
    } else if (containerId.includes('genre')) {
        message = 'Genres';
        icon = '🎸';
    } else if (containerId.includes('editor')) {
        message = "Editor's Picks";
        icon = '⭐';
    } else if (containerId.includes('recent')) {
        message = 'Recently Added';
        icon = '⏱️';
    } else if (containerId.includes('popular')) {
        message = 'Popular';
        icon = '📈';
    }
    
    return `
        <div class="coming-soon">
            <div class="coming-soon-icon">${icon}</div>
            <div class="coming-soon-text">${message}</div>
            <div class="coming-soon-subtext">Check back later</div>
        </div>
    `;
}

// ===== HEADER & FOOTER LOADER =====
function loadHeaderAndFooter() {
    Promise.all([
        fetch('/header.html').then(r => r.text()),
        fetch('/footer.html').then(r => r.text())
    ]).then(([headerData, footerData]) => {
        document.getElementById('header-placeholder').innerHTML = headerData;
        document.getElementById('footer-placeholder').innerHTML = footerData;
        
        // Initialize sidebar after header is loaded
        setTimeout(initializeSidebar, 100);
    }).catch(error => {
        console.log('Header/footer files not found:', error);
    });
}

// ===== SIDEBAR FUNCTIONS =====
function initializeSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebarBtn');

    if (hamburger && sidebar && overlay && closeBtn) {
        // Remove any existing listeners by cloning
        const newHamburger = hamburger.cloneNode(true);
        const newCloseBtn = closeBtn.cloneNode(true);
        const newOverlay = overlay.cloneNode(true);
        
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        overlay.parentNode.replaceChild(newOverlay, overlay);
        
        // Add new event listeners
        newHamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openSidebar();
        });
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
        
        newOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });

        // Keyboard escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const currentSidebar = document.getElementById('sidebar');
                const currentOverlay = document.getElementById('sidebarOverlay');
                if (currentSidebar && currentOverlay && currentSidebar.classList.contains('open')) {
                    closeSidebar();
                }
            }
        });
    } else {
        setTimeout(initializeSidebar, 100);
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== SCROLL BUTTON =====
function initializeScrollButton() {
    const scrollButton = document.getElementById('scrollBtn');
    if (!scrollButton) return;
    
    const progressCircle = scrollButton.querySelector('.progress');
    if (!progressCircle) return;
    
    const circumference = 2 * Math.PI * progressCircle.r.baseVal.value;
    progressCircle.style.strokeDasharray = circumference;

    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
        scrollButton.style.setProperty('--progress', scrollPercentage);
        
        if (scrollTop < 50) {
            scrollButton.classList.add('scroll-at-top');
            scrollButton.setAttribute('aria-label', 'Scroll Down');
        } else {
            scrollButton.classList.remove('scroll-at-top');
            scrollButton.setAttribute('aria-label', 'Scroll to Top');
        }
    };

    const handleClick = () => {
        const isAtTop = scrollButton.classList.contains('scroll-at-top');
        window.scrollTo({
            top: isAtTop ? document.body.scrollHeight : 0,
            behavior: 'smooth'
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    scrollButton.addEventListener('click', handleClick);
    handleScroll();
}

// ===== LIVE SEARCH =====
function initializeLiveSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const results = document.getElementById('liveSearchResults');
        if (results) {
            results.innerHTML = `
                <div class="coming-soon-search">
                    <span>🔍</span> Search coming soon
                </div>
            `;
        }
    });
    
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchMusic();
        });
    }
}

// ===== PAGE-SPECIFIC CONTENT LOADERS =====
function loadPageContent() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        loadHomepageContent();
    } else if (path === '/playlists.html') {
        loadPlaylistsContent();
    } else if (path === '/albums.html') {
        loadAlbumsContent();
    } else if (path === '/eps.html') {
        loadEPsContent();
    } else if (path === '/artists.html') {
        loadArtistsContent();
    }
}

function loadHomepageContent() {
    console.log('Homepage loaded');
    // Add homepage-specific loading here later
}

function loadPlaylistsContent() {
    console.log('Playlists page loaded');
    // Add playlist-specific loading here later
}

function loadAlbumsContent() {
    console.log('Albums page loaded');
    // Add album-specific loading here later
}

function loadEPsContent() {
    console.log('EPs page loaded');
    // Add EP-specific loading here later
}

function loadArtistsContent() {
    console.log('Artists page loaded');
    // Add artist-specific loading here later
}

// ===== SEARCH FUNCTIONS =====
function searchMusic() {
    const searchTerm = document.getElementById('searchInput')?.value;
    if (!searchTerm) return;
    alert(`🔍 Search for "${searchTerm}" - Coming soon!`);
    return false;
}

function searchByGenre(genre) {
    alert(`🎵 Browse ${genre} music - Coming soon!`);
    closeSidebar();
    return false;
}

function loadMore(page) {
    alert('📄 More content coming soon!');
    return false;
}

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadMore = loadMore;
window.closeSidebar = closeSidebar;