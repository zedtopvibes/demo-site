// ===== Zedtopvibes.com - Clean Main JavaScript =====
// NO API CONTENT - Just core functionality

let currentPage = 1;
let currentSearchTerm = '';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeaderAndFooter();
    
    // Initialize components
    initializeSidebar();
    initializeScrollButton();
    initializeLiveSearch();
    
    // All sections start empty - ready for your real content!
    // No API calls, no demo content, no placeholders
});

// ===== HEADER & FOOTER LOADER =====
function loadHeaderAndFooter() {
    Promise.all([
        fetch('/header.html').then(r => r.text()),
        fetch('/footer.html').then(r => r.text())
    ]).then(([headerData, footerData]) => {
        document.getElementById('header-placeholder').innerHTML = headerData;
        document.getElementById('footer-placeholder').innerHTML = footerData;
    }).catch(() => {
        console.log('Header/footer files not found');
    });
}

// ===== SIDEBAR FUNCTIONS =====
function initializeSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebarBtn');

    if (hamburger && sidebar && overlay && closeBtn) {
        hamburger.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
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

// ===== LIVE SEARCH (disabled until you have real data) =====
function initializeLiveSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // Search is disabled until you add real content
    searchInput.addEventListener('input', function(e) {
        // Do nothing - no demo search results
        document.getElementById('liveSearchResults').innerHTML = '';
    });
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

// ===== EMPTY CONTENT LOADERS - Ready for your REAL data =====
function loadHomepageContent() {
    // Leave all sections EMPTY
    // When you have real data, add your loaders here
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

// ===== SEARCH FUNCTIONS (disabled) =====
function searchMusic() {
    alert('Search will be available when content is added');
    return false;
}

function searchByGenre(genre) {
    alert(`Browse ${genre} music - coming soon!`);
    closeSidebar();
    return false;
}

function loadMore(page) {
    alert('More content coming soon!');
    return false;
}

// Helper functions (keep for future use)
function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substr(0, len) + '...' : str;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadMore = loadMore;
window.closeSidebar = closeSidebar;