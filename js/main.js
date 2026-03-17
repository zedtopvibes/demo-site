// ===== Zedtopvibes.com - Main JavaScript =====
// iTunes API constants
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
let currentPage = 1;
let currentSearchTerm = '';

// Simple cache
const apiCache = new Map();

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Show loading spinners immediately
    showAllLoadingSpinners();
    
    // Load header and footer first
    loadHeaderAndFooter().then(() => {
        // Initialize components
        initializeSidebar();
        initializeScrollButton();
        initializeLiveSearch();
        
        // Load content with delays to prevent blocking
        requestIdleCallback(() => {
            loadPageContent();
        }, { timeout: 2000 });
    });
});

// ===== CACHED FETCH =====
async function fetchWithCache(url, cacheTime = 300000) { // 5 minutes default
    const cached = apiCache.get(url);
    if (cached && (Date.now() - cached.timestamp < cacheTime)) {
        return cached.data;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    apiCache.set(url, {
        data: data,
        timestamp: Date.now()
    });
    
    return data;
}

// ===== LOADING SPINNERS =====
function showAllLoadingSpinners() {
    const containers = [
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
    
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id.includes('genres')) {
                element.innerHTML = getLoader('small');
            } else if (id.includes('grid') || id.includes('picks') || id.includes('recent') || id.includes('popular')) {
                element.innerHTML = getLoader('minimal');
            } else {
                element.innerHTML = getLoader('full');
            }
        }
    });
}

function getLoader(size = 'full') {
    let albumCount = size === 'full' ? 5 : 3;
    let sizeClass = size;
    
    let albums = '';
    for (let i = 0; i < albumCount; i++) {
        albums += '<div class="loader-album"></div>';
    }
    
    return `<div class="loader ${sizeClass}">${albums}</div>`;
}

// ===== HEADER & FOOTER LOADER =====
function loadHeaderAndFooter() {
    return Promise.all([
        fetch('/header.html').then(r => r.text()),
        fetch('/footer.html').then(r => r.text())
    ]).then(([headerData, footerData]) => {
        document.getElementById('header-placeholder').innerHTML = headerData;
        document.getElementById('footer-placeholder').innerHTML = footerData;
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
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
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
    
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value;
        
        if (searchTerm.length < 3) {
            document.getElementById('liveSearchResults').innerHTML = '';
            return;
        }
        
        // Debounce search
        searchTimeout = setTimeout(() => {
            const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=5&entity=song`;
            fetchWithCache(url, 60000) // 1 minute cache for search
                .then(data => {
                    let html = '<ul class="live-search-list">';
                    data.results.forEach(item => {
                        html += `<li><a href="${item.trackViewUrl || '#'}" target="_blank" rel="noopener">${item.trackName} - ${item.artistName}</a></li>`;
                    });
                    html += '</ul>';
                    document.getElementById('liveSearchResults').innerHTML = html;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }, 300);
    });
}

// ===== PAGE CONTENT LOADER =====
function loadPageContent() {
    const path = window.location.pathname;
    
    // Load critical content first, then defer the rest
    if (path === '/' || path === '/index.html') {
        // Load most important first
        setTimeout(() => loadTrending(), 100);
        setTimeout(() => loadLatestReleases(), 300);
        
        // Defer less important content
        setTimeout(() => loadHomePlaylists(), 1000);
        setTimeout(() => loadHomeAlbums(), 1500);
        setTimeout(() => loadHomeEPs(), 2000);
        setTimeout(() => loadHomeArtists(), 2500);
        setTimeout(() => loadGenres(), 3000);
    } else if (path === '/playlists.html') {
        setTimeout(() => loadPlaylistsPageContent(), 100);
    } else if (path === '/albums.html') {
        setTimeout(() => loadAlbumsPageContent(), 100);
    } else if (path === '/eps.html') {
        setTimeout(() => loadEPsPageContent(), 100);
    } else if (path === '/artists.html') {
        setTimeout(() => loadArtistsPageContent(), 100);
    }
}

// ===== OPTIMIZED FETCH FUNCTIONS =====
async function loadTrending() {
    try {
        const data = await fetchWithCache(ITUNES_TOP);
        const songs = data.feed.entry;
        displayTrending(songs);
    } catch (error) {
        console.error('Error loading trending:', error);
        document.getElementById('trending-container').innerHTML = '<div class="error-message">Unable to load trending music</div>';
    }
}

async function loadLatestReleases() {
    try {
        const data = await fetchWithCache(ITUNES_NEW);
        const albums = data.feed.entry;
        displayLatest(albums);
    } catch (error) {
        console.error('Error loading latest:', error);
        document.getElementById('latest-container').innerHTML = '<div class="error-message">Unable to load latest releases</div>';
    }
}

async function loadHomePlaylists() {
    try {
        const url = `${ITUNES_API}?term=playlist&limit=8&entity=playlist`;
        const data = await fetchWithCache(url);
        displayPlaylists(data.results, 'playlists-container');
    } catch (error) {
        console.error('Error loading playlists:', error);
        document.getElementById('playlists-container').innerHTML = '<div class="error-message">Unable to load playlists</div>';
    }
}

async function loadHomeAlbums() {
    try {
        const url = `${ITUNES_API}?term=album&limit=8&entity=album&sort=recent`;
        const data = await fetchWithCache(url);
        displayAlbums(data.results, 'albums-container');
    } catch (error) {
        console.error('Error loading albums:', error);
        document.getElementById('albums-container').innerHTML = '<div class="error-message">Unable to load albums</div>';
    }
}

async function loadHomeEPs() {
    try {
        const url = `${ITUNES_API}?term=ep&limit=8&entity=album`;
        const data = await fetchWithCache(url);
        displayEPs(data.results, 'eps-container');
    } catch (error) {
        console.error('Error loading EPs:', error);
        document.getElementById('eps-container').innerHTML = '<div class="error-message">Unable to load EPs</div>';
    }
}

async function loadHomeArtists() {
    try {
        const url = `${ITUNES_API}?term=artist&limit=8&entity=musicArtist`;
        const data = await fetchWithCache(url);
        displayArtists(data.results, 'artists-container');
    } catch (error) {
        console.error('Error loading artists:', error);
        document.getElementById('artists-container').innerHTML = '<div class="error-message">Unable to load artists</div>';
    }
}

// ===== DISPLAY FUNCTIONS (with lazy loading) =====
function displayTrending(songs) {
    let html = '';
    songs.slice(0, 8).forEach(song => {
        const name = song['im:name'].label;
        const artist = song['im:artist'].label;
        const image = song['im:image'][2]?.label || song['im:image'][0]?.label || 'https://via.placeholder.com/80';
        const releaseDate = new Date(song['im:releaseDate']?.label).getFullYear() || '2026';
        
        html += `
            <a class="music-item" href="${song.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 50 ? name.substr(0, 50) + '...' : name)}</b></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Released:</b> ${releaseDate}
                            <span class="new-badge" style="background:#ff9800; color:#fff; display:inline-flex; align-items:center; gap:6px; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">
                                <span style="line-height:1; font-weight:600;">Trending</span>
                            </span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('trending-container').innerHTML = html;
}

function displayLatest(albums) {
    let html = '';
    albums.slice(0, 8).forEach(album => {
        const name = album['im:name'].label;
        const artist = album['im:artist'].label;
        const image = album['im:image'][2]?.label || album['im:image'][0]?.label || 'https://via.placeholder.com/80';
        const releaseDate = new Date(album['im:releaseDate']?.label).getFullYear() || '2026';
        
        html += `
            <a class="music-item" href="${album.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 50 ? name.substr(0, 50) + '...' : name)}</b></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Released:</b> ${releaseDate}
                            <span class="new-badge" style="background:#4caf50; color:#fff; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">New</span>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('latest-container').innerHTML = html;
}

function displayPlaylists(items, containerId) {
    if (!items || items.length === 0) {
        document.getElementById(containerId).innerHTML = '<div class="error-message">No playlists found</div>';
        return;
    }

    let html = '';
    items.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown Playlist';
        const artist = item.artistName || 'Various Artists';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST';
        const trackCount = item.trackCount || Math.floor(Math.random() * 50) + 20;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 40 ? name.substr(0, 40) + '...' : name)}</b> <span class="playlist-badge">Playlist</span></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} songs</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById(containerId).innerHTML = html;
}

function displayAlbums(items, containerId) {
    if (!items || items.length === 0) {
        document.getElementById(containerId).innerHTML = '<div class="error-message">No albums found</div>';
        return;
    }

    let html = '';
    items.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown Album';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM';
        const trackCount = item.trackCount || Math.floor(Math.random() * 15) + 8;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 40 ? name.substr(0, 40) + '...' : name)}</b> <span class="album-badge">Album</span></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} tracks</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById(containerId).innerHTML = html;
}

function displayEPs(items, containerId) {
    if (!items || items.length === 0) {
        document.getElementById(containerId).innerHTML = '<div class="error-message">No EPs found</div>';
        return;
    }

    let html = '';
    items.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown EP';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/ff5722/ffffff?text=EP';
        const trackCount = item.trackCount || Math.floor(Math.random() * 6) + 3;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/ff5722/ffffff?text=EP'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 40 ? name.substr(0, 40) + '...' : name)}</b> <span class="ep-badge">EP</span></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} tracks</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById(containerId).innerHTML = html;
}

function displayArtists(items, containerId) {
    if (!items || items.length === 0) {
        document.getElementById(containerId).innerHTML = '<div class="error-message">No artists found</div>';
        return;
    }

    let html = '';
    items.slice(0, 8).forEach(item => {
        const name = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST';
        const genre = item.primaryGenreName || 'Various';
        const listeners = Math.floor(Math.random() * 90) + 10;
        
        html += `
            <a class="music-item" href="${item.artistLinkUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name)}</b> <span class="artist-badge">Artist</span></span>
                        <div class="artist-name">${escapeHtml(genre)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${listeners}M listeners</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById(containerId).innerHTML = html;
}

function loadGenres() {
    const genres = [
        { name: 'Rock', count: '1.2M', color: '#ff4b2b' },
        { name: 'Pop', count: '2.5M', color: '#ff4b2b' },
        { name: 'Hip-Hop', count: '1.8M', color: '#ff4b2b' },
        { name: 'Jazz', count: '856K', color: '#ff4b2b' },
        { name: 'Classical', count: '654K', color: '#ff4b2b' },
        { name: 'Electronic', count: '1.1M', color: '#ff4b2b' },
        { name: 'R&B', count: '945K', color: '#ff4b2b' },
        { name: 'Country', count: '723K', color: '#ff4b2b' }
    ];
    
    let html = '';
    genres.forEach(genre => {
        html += `
            <a class="music-item" href="#" onclick="searchByGenre('${genre.name.toLowerCase()}'); return false;">
                <div class="item-container" style="display:flex;align-items:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#007bff" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm1.5-7.5a.5.5 0 0 1-.5.5H6.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L6.707 7.5H9a.5.5 0 0 1 .5.5z"></path>
                    </svg>
                    <strong style="font-size:15px;color:#000;margin-left:6px;">${escapeHtml(genre.name)}</strong>
                    <span style="margin-left:4px; color:${genre.color}; font-weight:600;">(${genre.count})</span>
                </div>
            </a>
        `;
    });
    document.getElementById('genres-container').innerHTML = html;
}

// ===== PLAYLISTS PAGE CONTENT =====
async function loadPlaylistsPageContent() {
    try {
        const [main, editor, recent, popular] = await Promise.all([
            fetchWithCache(`${ITUNES_API}?term=playlist&limit=8&entity=playlist`),
            fetchWithCache(`${ITUNES_API}?term=editor&limit=4&entity=playlist`),
            fetchWithCache(`${ITUNES_API}?term=new&limit=4&entity=playlist&sort=recent`),
            fetchWithCache(`${ITUNES_API}?term=popular&limit=4&entity=playlist`)
        ]);
        
        displayPlaylists(main.results, 'playlists-main-grid');
        displayPlaylists(editor.results, 'editors-picks-grid');
        displayPlaylists(recent.results, 'recently-added-grid');
        displayPlaylists(popular.results, 'popular-grid');
        loadGenres();
    } catch (error) {
        console.error('Error loading playlists page:', error);
    }
}

// ===== ALBUMS PAGE CONTENT =====
async function loadAlbumsPageContent() {
    try {
        const [main, editor, recent, popular] = await Promise.all([
            fetchWithCache(`${ITUNES_API}?term=album&limit=8&entity=album&sort=recent`),
            fetchWithCache(`${ITUNES_API}?term=editor&limit=4&entity=album`),
            fetchWithCache(`${ITUNES_API}?term=new&limit=4&entity=album&sort=recent`),
            fetchWithCache(`${ITUNES_API}?term=popular&limit=4&entity=album`)
        ]);
        
        displayAlbums(main.results, 'albums-main-grid');
        displayAlbums(editor.results, 'editors-picks-grid');
        displayAlbums(recent.results, 'recently-added-grid');
        displayAlbums(popular.results, 'popular-grid');
        loadGenres();
    } catch (error) {
        console.error('Error loading albums page:', error);
    }
}

// ===== EPS PAGE CONTENT =====
async function loadEPsPageContent() {
    try {
        const [main, editor, recent, popular] = await Promise.all([
            fetchWithCache(`${ITUNES_API}?term=ep&limit=8&entity=album`),
            fetchWithCache(`${ITUNES_API}?term=editor&limit=4&entity=album`),
            fetchWithCache(`${ITUNES_API}?term=new&limit=4&entity=album&sort=recent`),
            fetchWithCache(`${ITUNES_API}?term=popular&limit=4&entity=album`)
        ]);
        
        displayEPs(main.results, 'eps-main-grid');
        displayEPs(editor.results, 'editors-picks-grid');
        displayEPs(recent.results, 'recently-added-grid');
        displayEPs(popular.results, 'popular-grid');
        loadGenres();
    } catch (error) {
        console.error('Error loading EPs page:', error);
    }
}

// ===== ARTISTS PAGE CONTENT =====
async function loadArtistsPageContent() {
    try {
        const [main, editor, recent, popular] = await Promise.all([
            fetchWithCache(`${ITUNES_API}?term=artist&limit=8&entity=musicArtist`),
            fetchWithCache(`${ITUNES_API}?term=editor&limit=4&entity=musicArtist`),
            fetchWithCache(`${ITUNES_API}?term=new&limit=4&entity=musicArtist&sort=recent`),
            fetchWithCache(`${ITUNES_API}?term=popular&limit=4&entity=musicArtist`)
        ]);
        
        displayArtists(main.results, 'artists-main-grid');
        displayArtists(editor.results, 'editors-picks-grid');
        displayArtists(recent.results, 'recently-added-grid');
        displayArtists(popular.results, 'popular-grid');
        loadGenres();
    } catch (error) {
        console.error('Error loading artists page:', error);
    }
}

// ===== SEARCH FUNCTIONS =====
async function searchMusic() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;
    currentSearchTerm = searchTerm;
    currentPage = 1;
    
    try {
        const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=25&entity=song`;
        const data = await fetchWithCache(url, 60000); // 1 minute cache for search
        
        displayResults(data.results, 'trending-container');
        document.getElementById('trending-title').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                <path d="M13.5 2C12 6 8 8 8 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-4-7-6.5-11z"></path>
            </svg>
            Search Results: "${escapeHtml(searchTerm)}"
        `;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('trending-container').innerHTML = '<div class="error-message">Error loading results. Please try again.</div>';
    }
}

async function searchByGenre(genre) {
    currentSearchTerm = genre;
    
    try {
        const url = `${ITUNES_API}?term=${encodeURIComponent(genre)}&limit=50&entity=song&attribute=genreTerm`;
        const data = await fetchWithCache(url, 300000); // 5 minute cache for genres
        
        displayResults(data.results, 'trending-container');
        document.getElementById('trending-title').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                <path d="M13.5 2C12 6 8 8 8 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-4-7-6.5-11z"></path>
            </svg>
            ${genre.charAt(0).toUpperCase() + genre.slice(1)} Music
        `;
        closeSidebar();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('trending-container').innerHTML = '<div class="error-message">Error loading results. Please try again.</div>';
    }
}

function displayResults(results, containerId) {
    if (!results || results.length === 0) {
        document.getElementById(containerId).innerHTML = '<div class="error-message">No results found</div>';
        return;
    }

    let html = '';
    results.slice(0, 8).forEach(item => {
        const name = item.trackName || item.collectionName || 'Unknown';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80';
        const releaseDate = item.releaseDate ? new Date(item.releaseDate).getFullYear() : '2026';
        
        html += `
            <a class="music-item" href="${item.trackViewUrl || item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(name.length > 50 ? name.substr(0, 50) + '...' : name)}</b></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Released:</b> ${releaseDate}
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById(containerId).innerHTML = html;
}

async function loadMore(page) {
    currentPage = page;
    try {
        const url = `${ITUNES_API}?term=new&limit=50&entity=album&sort=recent`;
        const data = await fetchWithCache(url);
        displayResults(data.results, 'trending-container');
        
        document.getElementById('trending-title').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z"></path>
            </svg>
            All Latest Releases
        `;
    } catch (error) {
        console.error('Error:', error);
    }
    return false;
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadMore = loadMore;
window.closeSidebar = closeSidebar;