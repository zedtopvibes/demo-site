// ===== Zedtopvibes.com - Test Site with Real API =====

const API_BASE = '/api';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Load header and footer
    await loadHeaderAndFooter();
    
    // Initialize components
    initializeScrollButton();
    initializeSidebar();
    initializeLiveSearch();
    
    // Load all content from real APIs
    await loadAllContent();
});

// ===== LOAD ALL SECTIONS FROM REAL APIS =====
async function loadAllContent() {
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

// ===== ALBUMS SECTION =====
async function loadAlbums() {
    const container = document.getElementById('albums-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading albums...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/albums`);
        const data = await response.json();
        
        // Handle both response formats (#1 and #2)
        let albums = data.results || data;
        
        if (!albums || albums.length === 0) {
            container.innerHTML = '<div class="error-message">No albums found</div>';
            return;
        }
        
        container.innerHTML = albums.map(album => `
            <a href="/album/${album.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${album.cover_url || '/images/default-album.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${album.title}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(album.title)}</b></span>
                        <div class="artist-name">${escapeHtml(album.artist_name || 'Unknown Artist')}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${album.track_count || 0} tracks</b>
                            ${album.release_date ? `<span style="margin-left:8px">${new Date(album.release_date).getFullYear()}</span>` : ''}
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading albums:', error);
        container.innerHTML = '<div class="error-message">Failed to load albums. Please try again later.</div>';
    }
}

// ===== LATEST RELEASES (using albums sorted by date) =====
async function loadLatestReleases() {
    const container = document.getElementById('latest-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading latest releases...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/albums`);
        const data = await response.json();
        let albums = data.results || data;
        
        // Sort by release date, newest first
        const latest = [...albums].sort((a, b) => 
            new Date(b.release_date) - new Date(a.release_date)
        ).slice(0, 6);
        
        if (!latest || latest.length === 0) {
            container.innerHTML = '<div class="error-message">No releases found</div>';
            return;
        }
        
        container.innerHTML = latest.map(album => `
            <a href="/album/${album.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${album.cover_url || '/images/default-album.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${album.title}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(album.title)}</b></span>
                        <div class="artist-name">${escapeHtml(album.artist_name || 'Unknown Artist')}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Released:</b> ${album.release_date ? new Date(album.release_date).getFullYear() : 'TBA'}
                            <span class="new-badge" style="background:#4caf50; color:#fff; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">New</span>
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading latest releases:', error);
        container.innerHTML = '<div class="error-message">Failed to load latest releases</div>';
    }
}

// ===== TRENDING NOW =====
async function loadTrending() {
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading trending...</div>';
    
    try {
        // Fetch albums and sort by plays for trending
        const response = await fetch(`${API_BASE}/albums`);
        const data = await response.json();
        let albums = data.results || data;
        
        // Sort by total_plays if available, otherwise by release date
        const trending = [...albums].sort((a, b) => 
            (b.total_plays || 0) - (a.total_plays || 0)
        ).slice(0, 6);
        
        if (!trending || trending.length === 0) {
            container.innerHTML = '<div class="error-message">No trending content available</div>';
            return;
        }
        
        container.innerHTML = trending.map(album => `
            <a href="/album/${album.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${album.cover_url || '/images/default-album.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${album.title}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(album.title)}</b></span>
                        <div class="artist-name">${escapeHtml(album.artist_name || 'Unknown Artist')}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${album.total_plays ? formatNumber(album.total_plays) + ' plays' : 'Trending'}</b>
                            <span class="new-badge" style="background:#ff9800; color:#fff; padding:2px 6px; margin-left:5px; border-radius:3px; font-size:11px;">🔥 Hot</span>
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading trending:', error);
        container.innerHTML = '<div class="error-message">Failed to load trending</div>';
    }
}

// ===== PLAYLISTS SECTION =====
async function loadPlaylists() {
    const container = document.getElementById('playlists-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading playlists...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/playlists`);
        const data = await response.json();
        let playlists = data.results || data;
        
        if (!playlists || playlists.length === 0) {
            container.innerHTML = '<div class="error-message">No playlists found</div>';
            return;
        }
        
        container.innerHTML = playlists.slice(0, 6).map(playlist => `
            <a href="/playlist/${playlist.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${playlist.cover_url || '/images/default-playlist.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${playlist.name}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(playlist.name)}</b> <span class="playlist-badge">Playlist</span></span>
                        <div class="artist-name">${escapeHtml(playlist.curator || 'Various Artists')}</div>
                        <span class="item-meta"><b style="color:#ff0000">${playlist.track_count || 0} songs</b></span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading playlists:', error);
        container.innerHTML = '<div class="error-message">Playlists coming soon</div>';
    }
}

// ===== EPs SECTION =====
async function loadEPs() {
    const container = document.getElementById('eps-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading EPs...</div>';
    
    try {
        // If you have a dedicated EPs endpoint, use it. Otherwise filter albums with track_count <= 6
        const response = await fetch(`${API_BASE}/albums`);
        const data = await response.json();
        let albums = data.results || data;
        
        const eps = albums.filter(album => album.track_count <= 6).slice(0, 6);
        
        if (!eps || eps.length === 0) {
            container.innerHTML = '<div class="error-message">No EPs found</div>';
            return;
        }
        
        container.innerHTML = eps.map(ep => `
            <a href="/album/${ep.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${ep.cover_url || '/images/default-ep.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${ep.title}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(ep.title)}</b> <span class="ep-badge">EP</span></span>
                        <div class="artist-name">${escapeHtml(ep.artist_name || 'Unknown Artist')}</div>
                        <span class="item-meta"><b style="color:#ff0000">${ep.track_count || 0} tracks</b></span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading EPs:', error);
        container.innerHTML = '<div class="error-message">EPs coming soon</div>';
    }
}

// ===== ARTISTS SECTION =====
async function loadArtists() {
    const container = document.getElementById('artists-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading artists...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/artists`);
        const data = await response.json();
        let artists = data.results || data;
        
        if (!artists || artists.length === 0) {
            container.innerHTML = '<div class="error-message">No artists found</div>';
            return;
        }
        
        container.innerHTML = artists.slice(0, 6).map(artist => `
            <a href="/artist/${artist.id}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${artist.image || artist.profile_image || '/images/default-artist.jpg'}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${artist.name}">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(artist.name)}</b> <span class="artist-badge">Artist</span></span>
                        <div class="artist-name">${artist.monthly_listeners ? formatNumber(artist.monthly_listeners) + ' monthly listeners' : ''}</div>
                        <span class="item-meta"><b style="color:#ff0000">${artist.genre || 'Featured'}</b></span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading artists:', error);
        container.innerHTML = '<div class="error-message">Artists coming soon</div>';
    }
}

// ===== GENRES SECTION =====
async function loadGenres() {
    const container = document.getElementById('genres-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading genres...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/genres`);
        const data = await response.json();
        let genres = data.results || data;
        
        if (!genres || genres.length === 0) {
            container.innerHTML = '<div class="error-message">No genres found</div>';
            return;
        }
        
        container.innerHTML = genres.map(genre => `
            <a class="music-item" href="#" onclick="searchByGenre('${genre.name.toLowerCase()}'); return false;">
                <div class="item-container" style="display:flex;align-items:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="#007bff" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm1.5-7.5a.5.5 0 0 1-.5.5H6.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L6.707 7.5H9a.5.5 0 0 1 .5.5z"></path>
                    </svg>
                    <strong style="font-size:15px;color:#000;margin-left:6px;">${escapeHtml(genre.name)}</strong>
                    <span style="margin-left:4px; color:#ff4b2b; font-weight:600;">(${formatNumber(genre.count || genre.track_count || 0)})</span>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading genres:', error);
        container.innerHTML = '<div class="error-message">Genres coming soon</div>';
    }
}

// ===== HELPER FUNCTIONS =====
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

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
        hamburger.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
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
    
    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollHeight > 0) ? (scrollTop / scrollHeight) * 100 : 0;
        scrollButton.style.setProperty('--progress', scrollPercentage);
        
        if (scrollTop < 50) {
            scrollButton.classList.add('scroll-at-top');
        } else {
            scrollButton.classList.remove('scroll-at-top');
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
    
    searchInput.addEventListener('input', async function(e) {
        const term = e.target.value.trim();
        const resultsDiv = document.getElementById('liveSearchResults');
        
        if (term.length < 2) {
            if (resultsDiv) resultsDiv.innerHTML = '';
            return;
        }
        
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="loading-small">Searching...</div>';
            
            try {
                const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(term)}`);
                const data = await response.json();
                const results = data.results || data;
                
                if (results && results.length > 0) {
                    resultsDiv.innerHTML = `
                        <ul class="live-search-list">
                            ${results.slice(0, 5).map(item => `
                                <li>
                                    <a href="/${item.type}/${item.id}">
                                        ${escapeHtml(item.title || item.name)} - ${escapeHtml(item.artist || '')}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                } else {
                    resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
                }
            } catch (error) {
                console.error('Search error:', error);
                resultsDiv.innerHTML = '<div class="error-message">Search failed</div>';
            }
        }
    });
}

// ===== GLOBAL FUNCTIONS =====
function searchByGenre(genre) {
    alert(`🎵 Browse ${genre} music - Coming soon!`);
    closeSidebar();
    return false;
}

function loadMore(page) {
    alert('📄 More content coming soon!');
    return false;
}

function searchMusic() {
    const searchTerm = document.getElementById('searchInput')?.value;
    if (searchTerm) {
        window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
    return false;
}

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadMore = loadMore;
window.closeSidebar = closeSidebar;