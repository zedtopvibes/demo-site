// ===== Zedtopvibes.com - Main JavaScript with API Content =====

// iTunes API constants
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
let currentPage = 1;
let currentSearchTerm = '';

// Simple cache to reduce API calls
const cache = {
    data: {},
    set: function(key, value, ttl = 300000) { // 5 minutes default
        this.data[key] = {
            value: value,
            expiry: Date.now() + ttl
        };
    },
    get: function(key) {
        const item = this.data[key];
        if (!item) return null;
        if (Date.now() > item.expiry) {
            delete this.data[key];
            return null;
        }
        return item.value;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadHeaderAndFooter();
    
    // Initialize components
    initializeSidebar();
    initializeScrollButton();
    initializeLiveSearch();
    
    // Load content immediately (no spinners)
    loadPageContent();
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
        // Fallback if header/footer not found
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

// ===== LIVE SEARCH =====
function initializeLiveSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeout);
        const searchTerm = e.target.value;
        
        if (searchTerm.length < 3) {
            document.getElementById('liveSearchResults').innerHTML = '';
            return;
        }
        
        timeout = setTimeout(() => {
            const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=5&entity=song`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let html = '<ul class="live-search-list">';
                    data.results.forEach(item => {
                        html += `<li><a href="${item.trackViewUrl || '#'}" target="_blank" rel="noopener">${escapeHtml(item.trackName)} - ${escapeHtml(item.artistName)}</a></li>`;
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

// ===== HOMEPAGE CONTENT =====
function loadHomepageContent() {
    loadTrending();
    loadLatestReleases();
    loadHomePlaylists();
    loadHomeAlbums();
    loadHomeEPs();
    loadHomeArtists();
    loadGenres();
}

async function loadTrending() {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    try {
        // Check cache first
        let data = cache.get('trending');
        if (!data) {
            const response = await fetch(ITUNES_TOP);
            data = await response.json();
            cache.set('trending', data);
        }
        
        const songs = data.feed.entry.slice(0, 8);
        container.innerHTML = songs.map(song => {
            const name = song['im:name'].label;
            const artist = song['im:artist'].label;
            const image = song['im:image'][2]?.label || song['im:image'][0]?.label || 'https://via.placeholder.com/80';
            const releaseDate = new Date(song['im:releaseDate']?.label).getFullYear() || '2026';
            
            return `
                <a class="music-item" href="${song.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                        </div>
                        <div class="item-data">
                            <span class="track-title"><b>${escapeHtml(truncate(name, 50))}</b></span>
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
        }).join('');
    } catch (error) {
        console.error('Error loading trending:', error);
        container.innerHTML = '<div class="error-message">Unable to load trending music</div>';
    }
}

async function loadLatestReleases() {
    const container = document.getElementById('latest-container');
    if (!container) return;
    
    try {
        let data = cache.get('latest');
        if (!data) {
            const response = await fetch(ITUNES_NEW);
            data = await response.json();
            cache.set('latest', data);
        }
        
        const albums = data.feed.entry.slice(0, 8);
        container.innerHTML = albums.map(album => {
            const name = album['im:name'].label;
            const artist = album['im:artist'].label;
            const image = album['im:image'][2]?.label || album['im:image'][0]?.label || 'https://via.placeholder.com/80';
            const releaseDate = new Date(album['im:releaseDate']?.label).getFullYear() || '2026';
            
            return `
                <a class="music-item" href="${album.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                        </div>
                        <div class="item-data">
                            <span class="track-title"><b>${escapeHtml(truncate(name, 50))}</b></span>
                            <div class="artist-name">${escapeHtml(artist)}</div>
                            <span class="item-meta">
                                <b style="color:#ff0000">Released:</b> ${releaseDate}
                                <span class="new-badge" style="background:#4caf50; color:#fff; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">New</span>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading latest:', error);
        container.innerHTML = '<div class="error-message">Unable to load latest releases</div>';
    }
}

async function loadHomePlaylists() {
    const container = document.getElementById('playlists-container');
    if (!container) return;
    
    try {
        const cacheKey = 'home-playlists';
        let data = cache.get(cacheKey);
        if (!data) {
            const response = await fetch(`${ITUNES_API}?term=playlist&limit=8&entity=playlist`);
            data = await response.json();
            cache.set(cacheKey, data);
        }
        
        container.innerHTML = (data.results || []).slice(0, 8).map(item => {
            const name = item.collectionName || 'Unknown Playlist';
            const artist = item.artistName || 'Various Artists';
            const image = item.artworkUrl100 || 'https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST';
            const trackCount = item.trackCount || Math.floor(Math.random() * 50) + 20;
            
            return `
                <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST'">
                        </div>
                        <div class="item-data">
                            <span class="track-title"><b>${escapeHtml(truncate(name, 40))}</b> <span class="playlist-badge">Playlist</span></span>
                            <div class="artist-name">${escapeHtml(artist)}</div>
                            <span class="item-meta">
                                <b style="color:#ff0000">${trackCount} songs</b>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading playlists:', error);
        container.innerHTML = '<div class="error-message">Unable to load playlists</div>';
    }
}

async function loadHomeAlbums() {
    const container = document.getElementById('albums-container');
    if (!container) return;
    
    try {
        const cacheKey = 'home-albums';
        let data = cache.get(cacheKey);
        if (!data) {
            const response = await fetch(`${ITUNES_API}?term=album&limit=8&entity=album&sort=recent`);
            data = await response.json();
            cache.set(cacheKey, data);
        }
        
        container.innerHTML = (data.results || []).slice(0, 8).map(item => {
            const name = item.collectionName || 'Unknown Album';
            const artist = item.artistName || 'Unknown Artist';
            const image = item.artworkUrl100 || 'https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM';
            const trackCount = item.trackCount || Math.floor(Math.random() * 15) + 8;
            
            return `
                <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM'">
                        </div>
                        <div class="item-data">
                            <span class="track-title"><b>${escapeHtml(truncate(name, 40))}</b> <span class="album-badge">Album</span></span>
                            <div class="artist-name">${escapeHtml(artist)}</div>
                            <span class="item-meta">
                                <b style="color:#ff0000">${trackCount} tracks</b>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading albums:', error);
        container.innerHTML = '<div class="error-message">Unable to load albums</div>';
    }
}

async function loadHomeEPs() {
    const container = document.getElementById('eps-container');
    if (!container) return;
    
    try {
        const cacheKey = 'home-eps';
        let data = cache.get(cacheKey);
        if (!data) {
            const response = await fetch(`${ITUNES_API}?term=ep&limit=8&entity=album`);
            data = await response.json();
            cache.set(cacheKey, data);
        }
        
        container.innerHTML = (data.results || []).slice(0, 8).map(item => {
            const name = item.collectionName || 'Unknown EP';
            const artist = item.artistName || 'Unknown Artist';
            const image = item.artworkUrl100 || 'https://via.placeholder.com/80/ff5722/ffffff?text=EP';
            const trackCount = item.trackCount || Math.floor(Math.random() * 6) + 3;
            
            return `
                <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/ff5722/ffffff?text=EP'">
                        </div>
                        <div class="item-data">
                            <span class="track-title"><b>${escapeHtml(truncate(name, 40))}</b> <span class="ep-badge">EP</span></span>
                            <div class="artist-name">${escapeHtml(artist)}</div>
                            <span class="item-meta">
                                <b style="color:#ff0000">${trackCount} tracks</b>
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading EPs:', error);
        container.innerHTML = '<div class="error-message">Unable to load EPs</div>';
    }
}

async function loadHomeArtists() {
    const container = document.getElementById('artists-container');
    if (!container) return;
    
    try {
        const cacheKey = 'home-artists';
        let data = cache.get(cacheKey);
        if (!data) {
            const response = await fetch(`${ITUNES_API}?term=artist&limit=8&entity=musicArtist`);
            data = await response.json();
            cache.set(cacheKey, data);
        }
        
        container.innerHTML = (data.results || []).slice(0, 8).map(item => {
            const name = item.artistName || 'Unknown Artist';
            const image = item.artworkUrl100 || 'https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST';
            const genre = item.primaryGenreName || 'Various';
            const listeners = Math.floor(Math.random() * 90) + 10;
            
            return `
                <a class="music-item" href="${item.artistLinkUrl || '#'}" target="_blank" rel="noopener">
                    <div class="item-container">
                        <div class="item-thumb">
                            <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST'">
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
        }).join('');
    } catch (error) {
        console.error('Error loading artists:', error);
        container.innerHTML = '<div class="error-message">Unable to load artists</div>';
    }
}

function loadGenres() {
    const container = document.getElementById('genres-container');
    if (!container) return;
    
    const genres = [
        { name: 'Rock', count: '1.2M' },
        { name: 'Pop', count: '2.5M' },
        { name: 'Hip-Hop', count: '1.8M' },
        { name: 'Jazz', count: '856K' },
        { name: 'Classical', count: '654K' },
        { name: 'Electronic', count: '1.1M' },
        { name: 'R&B', count: '945K' },
        { name: 'Country', count: '723K' }
    ];
    
    container.innerHTML = genres.map(genre => `
        <a class="music-item" href="#" onclick="searchByGenre('${genre.name.toLowerCase()}'); return false;">
            <div class="item-container" style="display:flex;align-items:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#007bff" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm1.5-7.5a.5.5 0 0 1-.5.5H6.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L6.707 7.5H9a.5.5 0 0 1 .5.5z"></path>
                </svg>
                <strong style="font-size:15px;color:#000;margin-left:6px;">${genre.name}</strong>
                <span style="margin-left:4px; color:#ff4b2b; font-weight:600;">(${genre.count})</span>
            </div>
        </a>
    `).join('');
}

// ===== SEARCH FUNCTIONS =====
async function searchMusic() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;
    currentSearchTerm = searchTerm;
    currentPage = 1;
    
    try {
        const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=25&entity=song`;
        const response = await fetch(url);
        const data = await response.json();
        
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
        const response = await fetch(url);
        const data = await response.json();
        
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
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="error-message">No results found</div>';
        return;
    }

    container.innerHTML = results.slice(0, 8).map(item => {
        const name = item.trackName || item.collectionName || 'Unknown';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80';
        const releaseDate = item.releaseDate ? new Date(item.releaseDate).getFullYear() : '2026';
        
        return `
            <a class="music-item" href="${item.trackViewUrl || item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(truncate(name, 50))}</b></span>
                        <div class="artist-name">${escapeHtml(artist)}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Released:</b> ${releaseDate}
                        </span>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

async function loadMore(page) {
    currentPage = page;
    try {
        const url = `${ITUNES_API}?term=new&limit=50&entity=album&sort=recent`;
        const response = await fetch(url);
        const data = await response.json();
        
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

// ===== PLAYLISTS PAGE CONTENT =====
async function loadPlaylistsPageContent() {
    try {
        const [main, editor, recent, popular] = await Promise.all([
            fetch(`${ITUNES_API}?term=playlist&limit=8&entity=playlist`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=editor&limit=4&entity=playlist`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=new&limit=4&entity=playlist&sort=recent`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=popular&limit=4&entity=playlist`).then(r => r.json())
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
            fetch(`${ITUNES_API}?term=album&limit=8&entity=album&sort=recent`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=editor&limit=4&entity=album`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=new&limit=4&entity=album&sort=recent`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=popular&limit=4&entity=album`).then(r => r.json())
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
            fetch(`${ITUNES_API}?term=ep&limit=8&entity=album`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=editor&limit=4&entity=album`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=new&limit=4&entity=album&sort=recent`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=popular&limit=4&entity=album`).then(r => r.json())
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
            fetch(`${ITUNES_API}?term=artist&limit=8&entity=musicArtist`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=editor&limit=4&entity=musicArtist`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=new&limit=4&entity=musicArtist&sort=recent`).then(r => r.json()),
            fetch(`${ITUNES_API}?term=popular&limit=4&entity=musicArtist`).then(r => r.json())
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

// Helper functions
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