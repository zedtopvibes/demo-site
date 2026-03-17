// ===== Zedtopvibes.com - Main JavaScript =====
// All functionality preserved exactly from original

// iTunes API constants
const ITUNES_API = 'https://itunes.apple.com/search';
const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
let currentPage = 1;
let currentSearchTerm = '';

// Initialize on load
window.onload = function() {
    loadTrending();
    loadLatestReleases();
};

// Search functions
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

function loadPlaylists() {
    alert('Loading all playlists...');
    return false;
}

function loadAlbums() {
    alert('Loading all albums...');
    return false;
}

function loadEPs() {
    alert('Loading all EPs...');
    return false;
}

function loadArtists() {
    alert('Loading all artists...');
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
window.closeSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};