// ===== Zedtopvibes.com - Main JavaScript =====
// NO DEMO CONTENT - Ready for real data integration

let currentPage = 1;
let currentSearchTerm = '';

// ===== DATA CONFIGURATION =====
// These functions should be replaced with actual API calls or data fetching
const DataService = {
    // Replace these with actual API endpoints or data sources
    async getTrending() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getLatestReleases() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getPlaylists() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getAlbums() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getEPs() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getArtists() {
        // TODO: Connect to real data source
        return [];
    },
    
    async getGenres() {
        // TODO: Connect to real data source
        return [];
    }
};

// ===== RENDER FUNCTIONS - TEMPLATES READY FOR REAL DATA =====
function renderMusicItems(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = getEmptyStateHTML(type);
        return;
    }
    
    let html = '';
    items.forEach(item => {
        switch(type) {
            case 'trending':
                html += renderTrendingItem(item);
                break;
            case 'latest':
                html += renderLatestItem(item);
                break;
            case 'playlist':
                html += renderPlaylistItem(item);
                break;
            case 'album':
                html += renderAlbumItem(item);
                break;
            case 'ep':
                html += renderEPItem(item);
                break;
            case 'artist':
                html += renderArtistItem(item);
                break;
            case 'genre':
                html += renderGenreItem(item);
                break;
        }
    });
    
    container.innerHTML = html;
}

// Individual item renderers (ready for real data structure)
function renderTrendingItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.name || 'Track'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.name || 'Untitled')}</b></span>
                    <div class="artist-name">${escapeHtml(item.artist || 'Unknown Artist')}</div>
                    <span class="item-meta">
                        <b style="color:#ff0000">Released:</b> ${item.year || 'TBA'}
                        ${item.badge ? `<span class="new-badge" style="background:#ff9800; color:#fff; display:inline-flex; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">${escapeHtml(item.badge)}</span>` : ''}
                    </span>
                </div>
            </div>
        </a>
    `;
}

function renderLatestItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.name || 'Release'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.name || 'Untitled')}</b></span>
                    <div class="artist-name">${escapeHtml(item.artist || 'Unknown Artist')}</div>
                    <span class="item-meta">
                        <b style="color:#ff0000">Released:</b> ${item.year || 'TBA'}
                        ${item.isNew ? `<span class="new-badge" style="background:#4caf50; color:#fff; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">New</span>` : ''}
                    </span>
                </div>
            </div>
        </a>
    `;
}

function renderPlaylistItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.name || 'Playlist'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.name || 'Untitled')}</b> <span class="playlist-badge">Playlist</span></span>
                    <div class="artist-name">${escapeHtml(item.curator || item.artist || 'Various Artists')}</div>
                    <span class="item-meta"><b style="color:#ff0000">${item.trackCount || '0'} songs</b></span>
                </div>
            </div>
        </a>
    `;
}

function renderAlbumItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.title || 'Album'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.title || 'Untitled')}</b> <span class="album-badge">Album</span></span>
                    <div class="artist-name">${escapeHtml(item.artist || 'Unknown Artist')}</div>
                    <span class="item-meta"><b style="color:#ff0000">${item.trackCount || '0'} tracks</b></span>
                </div>
            </div>
        </a>
    `;
}

function renderEPItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.title || 'EP'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.title || 'Untitled')}</b> <span class="ep-badge">EP</span></span>
                    <div class="artist-name">${escapeHtml(item.artist || 'Unknown Artist')}</div>
                    <span class="item-meta"><b style="color:#ff0000">${item.trackCount || '0'} tracks</b></span>
                </div>
            </div>
        </a>
    `;
}

function renderArtistItem(item) {
    return `
        <a class="music-item" href="${item.url || '#'}">
            <div class="item-container">
                <div class="item-thumb">
                    <img src="${item.image || '/images/placeholder.jpg'}" width="80" height="80" class="roundthumb" alt="${item.name || 'Artist'}">
                </div>
                <div class="item-data">
                    <span class="track-title"><b>${escapeHtml(item.name || 'Untitled')}</b> <span class="artist-badge">Artist</span></span>
                    <div class="artist-name">${item.monthlyListeners ? `${item.monthlyListeners} monthly listeners` : ''}</div>
                    <span class="item-meta"><b style="color:#ff0000">${item.genre || 'Featured'}</b></span>
                </div>
            </div>
        </a>
    `;
}

function renderGenreItem(item) {
    return `
        <a class="music-item" href="#" onclick="searchByGenre('${escapeHtml(item.name || '').toLowerCase()}'); return false;">
            <div class="item-container" style="display:flex;align-items:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#007bff" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm1.5-7.5a.5.5 0 0 1-.5.5H6.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L6.707 7.5H9a.5.5 0 0 1 .5.5z"></path>
                </svg>
                <strong style="font-size:15px;color:#000;margin-left:6px;">${escapeHtml(item.name || 'Genre')}</strong>
                <span style="margin-left:4px; color:#ff4b2b; font-weight:600;">(${item.count || '0'})</span>
            </div>
        </a>
    `;
}

function getEmptyStateHTML(type) {
    // Empty state - ready for real data, not "Coming Soon"
    return `
        <div class="empty-state">
            <div class="empty-icon">🎵</div>
            <div class="empty-text">No ${type} available</div>
            <div class="empty-subtext">Check back later</div>
        </div>
    `;
}

// Helper function to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== LOAD FUNCTIONS - CONNECT TO REAL DATA =====
async function loadTrending() {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getTrending();
        renderMusicItems('trending-container', items, 'trending');
    } catch (error) {
        console.error('Error loading trending:', error);
        container.innerHTML = getEmptyStateHTML('trending items');
    }
}

async function loadLatestReleases() {
    const container = document.getElementById('latest-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getLatestReleases();
        renderMusicItems('latest-container', items, 'latest');
    } catch (error) {
        console.error('Error loading latest releases:', error);
        container.innerHTML = getEmptyStateHTML('latest releases');
    }
}

async function loadPlaylists() {
    const container = document.getElementById('playlists-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getPlaylists();
        renderMusicItems('playlists-container', items, 'playlist');
    } catch (error) {
        console.error('Error loading playlists:', error);
        container.innerHTML = getEmptyStateHTML('playlists');
    }
}

async function loadAlbums() {
    const container = document.getElementById('albums-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getAlbums();
        renderMusicItems('albums-container', items, 'album');
    } catch (error) {
        console.error('Error loading albums:', error);
        container.innerHTML = getEmptyStateHTML('albums');
    }
}

async function loadEPs() {
    const container = document.getElementById('eps-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getEPs();
        renderMusicItems('eps-container', items, 'ep');
    } catch (error) {
        console.error('Error loading EPs:', error);
        container.innerHTML = getEmptyStateHTML('EPs');
    }
}

async function loadArtists() {
    const container = document.getElementById('artists-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getArtists();
        renderMusicItems('artists-container', items, 'artist');
    } catch (error) {
        console.error('Error loading artists:', error);
        container.innerHTML = getEmptyStateHTML('artists');
    }
}

async function loadGenres() {
    const container = document.getElementById('genres-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const items = await DataService.getGenres();
        renderMusicItems('genres-container', items, 'genre');
    } catch (error) {
        console.error('Error loading genres:', error);
        container.innerHTML = getEmptyStateHTML('genres');
    }
}

// ===== LOAD ALL SECTIONS =====
async function loadAllContent() {
    // Load all sections in parallel
    await Promise.all([
        loadTrending(),
        loadLatestReleases(),
        loadPlaylists(),
        loadAlbums(),
        loadEPs(),
        loadArtists(),
        loadGenres()
    ]);
}

// ===== SEARCH FUNCTIONS =====
async function searchMusic() {
    const searchTerm = document.getElementById('searchInput')?.value;
    if (!searchTerm) return;
    
    currentSearchTerm = searchTerm;
    // TODO: Connect to real search API
    console.log('Search for:', searchTerm);
    
    // Example of how to handle search results
    const results = await performSearch(searchTerm);
    displaySearchResults(results);
}

async function performSearch(term) {
    // TODO: Replace with actual search API
    return [];
}

function displaySearchResults(results) {
    // TODO: Display search results
    console.log('Search results:', results);
}

function searchByGenre(genre) {
    // TODO: Connect to real genre filtering
    console.log('Genre selected:', genre);
    closeSidebar();
    return false;
}

function loadMore(page) {
    // TODO: Implement pagination with real data
    console.log('Load more, page:', page);
    return false;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    // Load header and footer
    await loadHeaderAndFooter();
    
    // Initialize components
    initializeScrollButton();
    initializeLiveSearch();
    
    // Load all content sections
    await loadAllContent();
    
    // Initialize sidebar after header is loaded
    setTimeout(initializeSidebar, 100);
});

// ===== HEADER & FOOTER LOADER =====
async function loadHeaderAndFooter() {
    try {
        const [headerData, footerData] = await Promise.all([
            fetch('/header.html').then(r => r.text()),
            fetch('/footer.html').then(r => r.text())
        ]);
        
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerData;
        if (footerPlaceholder) footerPlaceholder.innerHTML = footerData;
    } catch (error) {
        console.log('Header/footer files not found:', error);
    }
}

// ===== SIDEBAR FUNCTIONS =====
function initializeSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebarBtn');

    if (hamburger && sidebar && overlay && closeBtn) {
        const newHamburger = hamburger.cloneNode(true);
        const newCloseBtn = closeBtn.cloneNode(true);
        const newOverlay = overlay.cloneNode(true);
        
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        overlay.parentNode.replaceChild(newOverlay, overlay);
        
        newHamburger.addEventListener('click', (e) => {
            e.preventDefault();
            openSidebar();
        });
        
        newCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });
        
        newOverlay.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
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
    
    const resultsDiv = document.getElementById('liveSearchResults');
    if (!resultsDiv) return;
    
    searchInput.addEventListener('input', async function(e) {
        const term = e.target.value.trim();
        
        if (term.length < 2) {
            resultsDiv.innerHTML = '';
            return;
        }
        
        resultsDiv.innerHTML = '<div class="loading-small">Searching...</div>';
        
        // TODO: Connect to real search API
        const results = await performSearch(term);
        
        if (results.length > 0) {
            resultsDiv.innerHTML = renderSearchSuggestions(results);
        } else {
            resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
        }
    });
    
    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.innerHTML = '';
        }
    });
}

function renderSearchSuggestions(results) {
    // TODO: Implement proper search suggestion rendering
    return `
        <ul class="live-search-list">
            ${results.map(item => `
                <li>
                    <a href="#" onclick="handleSearchSelect('${escapeHtml(item.name)}'); return false;">
                        ${escapeHtml(item.name)} - ${escapeHtml(item.artist || '')}
                    </a>
                </li>
            `).join('')}
        </ul>
    `;
}

function handleSearchSelect(term) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = term;
        searchMusic();
    }
    document.getElementById('liveSearchResults').innerHTML = '';
}

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadMore = loadMore;
window.closeSidebar = closeSidebar;
window.handleSearchSelect = handleSearchSelect;