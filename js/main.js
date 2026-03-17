// ===== Zedtopvibes.com - Main JavaScript =====

// iTunes API constants
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
let currentPage = 1;
let currentSearchTerm = '';

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // First, load header and footer
    loadHeaderAndFooter().then(() => {
        // Then initialize sidebar (now that header exists)
        initializeSidebar();
        
        // Then load content based on which page we're on
        loadPageContent();
    });
});

// Load header and footer
function loadHeaderAndFooter() {
    return Promise.all([
        fetch('/header.html').then(r => r.text()),
        fetch('/footer.html').then(r => r.text())
    ]).then(([headerData, footerData]) => {
        document.getElementById('header-placeholder').innerHTML = headerData;
        document.getElementById('footer-placeholder').innerHTML = footerData;
    });
}

// Initialize sidebar functionality
function initializeSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebarBtn');

    if (hamburger && sidebar && overlay && closeBtn) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
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

// Load content based on current page
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

// ===== HOMEPAGE CONTENT LOADERS =====
function loadHomepageContent() {
    loadTrending();
    loadLatestReleases();
    loadHomePlaylists();
    loadHomeAlbums();
    loadHomeEPs();
    loadHomeArtists();
    loadGenres();
}

function loadTrending() {
    fetch(ITUNES_TOP)
        .then(response => response.json())
        .then(data => {
            const songs = data.feed.entry;
            displayTrending(songs);
        })
        .catch(error => {
            console.error('Error loading trending:', error);
        });
}

function loadLatestReleases() {
    fetch(ITUNES_NEW)
        .then(response => response.json())
        .then(data => {
            const albums = data.feed.entry;
            displayLatest(albums);
        })
        .catch(error => {
            console.error('Error loading latest:', error);
        });
}

// ... rest of your existing loader functions ...
// (keep all your displayTrending, displayLatest, loadHomePlaylists, etc.)