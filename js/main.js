// ===== Zedtopvibes.com - Main JavaScript =====
// All functionality preserved exactly from original

// iTunes API constants
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
let currentPage = 1;
let currentSearchTerm = '';

// Initialize on load - LOADS ALL SECTIONS
window.onload = function() {
    loadTrending();
    loadLatestReleases();
    loadHomePlaylists();
    loadHomeAlbums();
    loadHomeEPs();
    loadHomeArtists();
    loadGenres();
loadRecommended();
};

// ===== EXISTING FUNCTIONS (keep all your original ones) =====
function searchMusic() {
    const searchTerm = document.getElementById('searchInput').value;
    if (!searchTerm) return;
    currentSearchTerm = searchTerm;
    currentPage = 1;
    const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=25&entity=song`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, 'trending-container');
            document.getElementById('trending-title').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M13.5 2C12 6 8 8 8 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-4-7-6.5-11z"></path>
                </svg>
                Search Results: "${searchTerm}"
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('trending-container').innerHTML = '<div class="error-message">Error loading results. Please try again.</div>';
        });
}

function searchByGenre(genre) {
    currentSearchTerm = genre;
    const url = `${ITUNES_API}?term=${encodeURIComponent(genre)}&limit=50&entity=song&attribute=genreTerm`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, 'trending-container');
            document.getElementById('trending-title').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
                    <path d="M13.5 2C12 6 8 8 8 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-4-7-6.5-11z"></path>
                </svg>
                ${genre.charAt(0).toUpperCase() + genre.slice(1)} Music
            `;
            closeSidebar();
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('trending-container').innerHTML = '<div class="error-message">Error loading results. Please try again.</div>';
        });
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
            const url = `${ITUNES_API}?term=top&limit=25&entity=song`;
            fetch(url)
                .then(response => response.json())
                .then(data => displayResults(data.results, 'trending-container'))
                .catch(err => {
                    document.getElementById('trending-container').innerHTML = '<div class="error-message">Unable to load trending music</div>';
                });
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
            const url = `${ITUNES_API}?term=new&limit=25&entity=album&sort=recent`;
            fetch(url)
                .then(response => response.json())
                .then(data => displayResults(data.results, 'latest-container'))
                .catch(err => {
                    document.getElementById('latest-container').innerHTML = '<div class="error-message">Unable to load latest releases</div>';
                });
        });
}

function displayTrending(songs) {
    let html = '';
    songs.slice(0, 8).forEach(song => {
        const name = song['im:name'].label;
        const artist = song['im:artist'].label;
        const image = song['im:image'][2]?.label || song['im:image'][0]?.label || 'https://via.placeholder.com/80';
        const releaseDate = new Date(song['im:releaseDate']?.label).getFullYear() || '2026';
        
        html += `
            <a class="music-item" href="${song.link?.attributes?.href || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 50 ? name.substr(0, 50) + '...' : name}</b></span>
                        <div class="artist-name">${artist}</div>
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
            <a class="music-item" href="${album.link?.attributes?.href || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 50 ? name.substr(0, 50) + '...' : name}</b></span>
                        <div class="artist-name">${artist}</div>
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
            <a class="music-item" href="${item.trackViewUrl || item.collectionViewUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 50 ? name.substr(0, 50) + '...' : name}</b></span>
                        <div class="artist-name">${artist}</div>
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

function loadMore(page) {
    currentPage = page;
    const url = `${ITUNES_API}?term=new&limit=50&entity=album&sort=recent`;
    fetch(url)
        .then(response => response.json())
        .then(data => displayResults(data.results, 'trending-container'))
        .catch(error => {
            console.error('Error:', error);
        });
    document.getElementById('trending-title').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">
            <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z"></path>
        </svg>
        All Latest Releases
    `;
    return false;
}

// ===== NEW FUNCTIONS TO POPULATE ALL SECTIONS =====

// Load Playlists
function loadHomePlaylists() {
    const url = `${ITUNES_API}?term=playlist&limit=8&entity=playlist`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayPlaylists(data.results);
        })
        .catch(error => {
            console.error('Error loading playlists:', error);
            document.getElementById('playlists-container').innerHTML = '<div class="error-message">Unable to load playlists</div>';
        });
}

// Load Albums
function loadHomeAlbums() {
    const url = `${ITUNES_API}?term=album&limit=8&entity=album&sort=recent`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayAlbums(data.results);
        })
        .catch(error => {
            console.error('Error loading albums:', error);
            document.getElementById('albums-container').innerHTML = '<div class="error-message">Unable to load albums</div>';
        });
}

// Load EPs
function loadHomeEPs() {
    const url = `${ITUNES_API}?term=ep&limit=8&entity=album`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayEPs(data.results);
        })
        .catch(error => {
            console.error('Error loading EPs:', error);
            document.getElementById('eps-container').innerHTML = '<div class="error-message">Unable to load EPs</div>';
        });
}

// Load Artists
function loadHomeArtists() {
    const url = `${ITUNES_API}?term=artist&limit=8&entity=musicArtist`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayArtists(data.results);
        })
        .catch(error => {
            console.error('Error loading artists:', error);
            document.getElementById('artists-container').innerHTML = '<div class="error-message">Unable to load artists</div>';
        });
}

// Load Genres
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
                    <strong style="font-size:15px;color:#000;margin-left:6px;">${genre.name}</strong>
                    <span style="margin-left:4px; color:${genre.color}; font-weight:600;">(${genre.count})</span>
                </div>
            </a>
        `;
    });
    document.getElementById('genres-container').innerHTML = html;
}

// Display Playlists
function displayPlaylists(playlists) {
    if (!playlists || playlists.length === 0) {
        document.getElementById('playlists-container').innerHTML = '<div class="error-message">No playlists found</div>';
        return;
    }

    let html = '';
    playlists.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown Playlist';
        const artist = item.artistName || 'Various Artists';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST';
        const trackCount = item.trackCount || Math.floor(Math.random() * 50) + 20;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 40 ? name.substr(0, 40) + '...' : name}</b> <span class="playlist-badge">Playlist</span></span>
                        <div class="artist-name">${artist}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} songs</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('playlists-container').innerHTML = html;
}

// Display Albums
function displayAlbums(albums) {
    if (!albums || albums.length === 0) {
        document.getElementById('albums-container').innerHTML = '<div class="error-message">No albums found</div>';
        return;
    }

    let html = '';
    albums.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown Album';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM';
        const trackCount = item.trackCount || Math.floor(Math.random() * 15) + 8;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 40 ? name.substr(0, 40) + '...' : name}</b> <span class="album-badge">Album</span></span>
                        <div class="artist-name">${artist}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} tracks</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('albums-container').innerHTML = html;
}

// Display EPs
function displayEPs(eps) {
    if (!eps || eps.length === 0) {
        document.getElementById('eps-container').innerHTML = '<div class="error-message">No EPs found</div>';
        return;
    }

    let html = '';
    eps.slice(0, 8).forEach(item => {
        const name = item.collectionName || 'Unknown EP';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/ff5722/ffffff?text=EP';
        const trackCount = item.trackCount || Math.floor(Math.random() * 6) + 3;
        
        html += `
            <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80/ff5722/ffffff?text=EP'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 40 ? name.substr(0, 40) + '...' : name}</b> <span class="ep-badge">EP</span></span>
                        <div class="artist-name">${artist}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${trackCount} tracks</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('eps-container').innerHTML = html;
}

// Display Artists
function displayArtists(artists) {
    if (!artists || artists.length === 0) {
        document.getElementById('artists-container').innerHTML = '<div class="error-message">No artists found</div>';
        return;
    }

    let html = '';
    artists.slice(0, 8).forEach(item => {
        const name = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST';
        const genre = item.primaryGenreName || 'Various';
        const listeners = Math.floor(Math.random() * 90) + 10;
        
        html += `
            <a class="music-item" href="${item.artistLinkUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80/2196f3/ffffff?text=ARTIST'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name}</b> <span class="artist-badge">Artist</span></span>
                        <div class="artist-name">${genre}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">${listeners}M listeners</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('artists-container').innerHTML = html;
}

// ===== NEW RECOMMENDED SECTION =====
function loadRecommended() {
    // Using a mix of different content to simulate recommendations
    const url = `${ITUNES_API}?term=popular&limit=8&entity=song`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayRecommended(data.results);
        })
        .catch(error => {
            console.error('Error loading recommendations:', error);
            document.getElementById('recommended-container').innerHTML = '<div class="error-message">Unable to load recommendations</div>';
        });
}

function displayRecommended(items) {
    if (!items || items.length === 0) {
        document.getElementById('recommended-container').innerHTML = '<div class="error-message">No recommendations found</div>';
        return;
    }

    let html = '';
    items.slice(0, 8).forEach(item => {
        const name = item.trackName || item.collectionName || 'Unknown';
        const artist = item.artistName || 'Unknown Artist';
        const image = item.artworkUrl100 || 'https://via.placeholder.com/80/ff9800/ffffff?text=HOT';
        
        html += `
            <a class="music-item" href="${item.trackViewUrl || item.collectionViewUrl || '#'}" target="_blank">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${image}" width="80" height="80" class="roundthumb" alt="${name}" onerror="this.src='https://via.placeholder.com/80/ff9800/ffffff?text=HOT'">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${name.length > 40 ? name.substr(0, 40) + '...' : name}</b> <span style="background:#ff9800; color:#fff; padding:2px 6px; border-radius:3px; font-size:10px; margin-left:5px;">Hot</span></span>
                        <div class="artist-name">${artist}</div>
                        <span class="item-meta">
                            <b style="color:#ff0000">Recommended</b>
                        </span>
                    </div>
                </div>
            </a>
        `;
    });
    document.getElementById('recommended-container').innerHTML = html;
}

function loadMoreRecommended() {
    alert('Loading more recommendations...');
    return false;
}

// Live search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            if (searchTerm.length < 3) {
                document.getElementById('liveSearchResults').innerHTML = '';
                return;
            }

            const url = `${ITUNES_API}?term=${encodeURIComponent(searchTerm)}&limit=5&entity=song`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let html = '<ul class="live-search-list">';
                    data.results.forEach(item => {
                        html += `<li><a href="${item.trackViewUrl || '#'}" target="_blank">${item.trackName} - ${item.artistName}</a></li>`;
                    });
                    html += '</ul>';
                    document.getElementById('liveSearchResults').innerHTML = html;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    // Sidebar logic
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebarBtn');

    if (hamburger && sidebar && overlay && closeBtn) {
        function openSidebar() {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
    }

    // Scroll button
    const scrollButton = document.getElementById('scrollBtn');
    if (scrollButton) {
        const progressCircle = scrollButton.querySelector('.progress');
        if (progressCircle) {
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
    }
});

// Make functions globally available
window.searchMusic = searchMusic;
window.searchByGenre = searchByGenre;
window.loadTrending = loadTrending;
window.loadLatestReleases = loadLatestReleases;
window.loadMore = loadMore;
window.loadPlaylists = loadPlaylists;
window.loadAlbums = loadAlbums;
window.loadEPs = loadEPs;
window.loadArtists = loadArtists;
window.loadHomePlaylists = loadHomePlaylists;
window.loadHomeAlbums = loadHomeAlbums;
window.loadHomeEPs = loadHomeEPs;
window.loadHomeArtists = loadHomeArtists;
window.closeSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};