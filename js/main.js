// ===== Zedtopvibes.com - Clean Main JavaScript =====
// NO API CONTENT - Just core functionality with Coming Soon placeholders

let currentPage = 1;
let currentSearchTerm = '';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeaderAndFooter();
    
    // Initialize components that don't depend on header
    initializeScrollButton();
    initializeLiveSearch();
    
    // Show coming soon in all sections immediately
    showComingSoon();
});

// ===== SHOW COMING SOON IN ALL SECTIONS =====
function showComingSoon() {
    // Homepage sections
    const sections = [
        'trending-container',
        'latest-container',
        'playlists-container',
        'albums-container',
        'eps-container',
        'artists-container',
        'genres-container',
        'playlists-main-grid',
        'editors-picks-grid',
        'recently-added-grid',
        'popular-grid',
        'albums-main-grid',
        'eps-main-grid',
        'artists-main-grid'
    ];
    
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = getComingSoonHTML(id);
        }
    });
}

function getComingSoonHTML(sectionId) {
    // Different messages for different sections
    let message = 'Coming Soon';
    let icon = '🎵';
    
    if (sectionId.includes('trending')) {
        message = 'Trending tracks coming soon';
        icon = '🔥';
    } else if (sectionId.includes('latest')) {
        message = 'Latest releases coming soon';
        icon = '🆕';
    } else if (sectionId.includes('playlist')) {
        message = 'Playlists coming soon';
        icon = '📋';
    } else if (sectionId.includes('album')) {
        message = 'Albums coming soon';
        icon = '💿';
    } else if (sectionId.includes('eps')) {
        message = 'EPs coming soon';
        icon = '🎼';
    } else if (sectionId.includes('artist')) {
        message = 'Artists coming soon';
        icon = '🎤';
    } else if (sectionId.includes('genre')) {
        message = 'Genres coming soon';
        icon = '🎸';
    } else if (sectionId.includes('editor')) {
        message = "Editor's picks coming soon";
        icon = '⭐';
    } else if (sectionId.includes('recent')) {
        message = 'Recently added coming soon';
        icon = '⏱️';
    } else if (sectionId.includes('popular')) {
        message = 'Popular items coming soon';
        icon = '📈';
    }
    
    return `
        <div class="coming-soon">
            <div class="coming-soon-icon">${icon}</div>
            <div class="coming-soon-text">${message}</div>
            <div class="coming-soon-subtext">Check back later for updates</div>
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
        // Remove any existing listeners
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
        // Show coming soon for search too
        const results = document.getElementById('liveSearchResults');
        if (results) {
            results.innerHTML = '<div class="coming-soon-search">🔍 Search coming soon</div>';
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

// ===== PAGE CONTENT LOADER =====
function loadPageContent() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        loadHomepageContent();
    } else if (path === '/playlists.html') {
        loadPlaylistsPageContent();
    } else if (path === '/albums.html') {
        loadAlbumsPageContent();
    } else if (path === '/eps.html') {
        loadEPsPageContent();
    } else if (path === '/artists.html') {
        loadArtistsPageContent();
    }
}

// ===== EMPTY CONTENT LOADERS =====
function loadHomepageContent() {
    // Already showing coming soon via showComingSoon()
    console.log('Homepage ready for content');
}

function loadPlaylistsPageContent() {
    console.log('Playlists page ready for content');
}

function loadAlbumsPageContent() {
    console.log('Albums page ready for content');
}

function loadEPsPageContent() {
    console.log('EPs page ready for content');
}

function loadArtistsPageContent() {
    console.log('Artists page ready for content');
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