// ===== Zedtopvibes.com - Optimized Main JavaScript =====

// Use setTimeout to defer non-critical loading
setTimeout(() => {
    'use strict';
    
    // Constants
    const ITUNES_API = 'https://itunes.apple.com/search';
    const ITUNES_TOP = 'https://itunes.apple.com/us/rss/topsongs/limit=25/json';
    const ITUNES_NEW = 'https://itunes.apple.com/us/rss/newreleases/limit=25/json';
    
    // Cache with expiration
    const cache = {
        data: new Map(),
        timers: new Map(),
        get: function(key) {
            return this.data.get(key);
        },
        set: function(key, value, ttl = 300000) { // 5 min default
            this.data.set(key, value);
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
            }
            this.timers.set(key, setTimeout(() => {
                this.data.delete(key);
                this.timers.delete(key);
            }, ttl));
        }
    };

    // Lazy load sections based on viewport
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const loader = section.dataset.loader;
                if (loader && !section.classList.contains('loaded')) {
                    window[loader]?.();
                    section.classList.add('loaded');
                }
            }
        });
    }, { rootMargin: '200px' });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadHeaderAndFooter();
        setupSidebar();
        setupScrollButton();
        setupSearch();
        observeSections();
    }

    // Load header/footer with minimal impact
    function loadHeaderAndFooter() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if (headerPlaceholder && !headerPlaceholder.hasAttribute('data-loaded')) {
            fetch('/header.html')
                .then(r => r.text())
                .then(html => {
                    headerPlaceholder.innerHTML = html;
                    headerPlaceholder.setAttribute('data-loaded', 'true');
                })
                .catch(() => {});
        }
        
        if (footerPlaceholder && !footerPlaceholder.hasAttribute('data-loaded')) {
            fetch('/footer.html')
                .then(r => r.text())
                .then(html => {
                    footerPlaceholder.innerHTML = html;
                    footerPlaceholder.setAttribute('data-loaded', 'true');
                })
                .catch(() => {});
        }
    }

    // Setup sidebar with event delegation
    function setupSidebar() {
        document.addEventListener('click', (e) => {
            const hamburger = e.target.closest('#hamburgerBtn');
            const closeBtn = e.target.closest('#closeSidebarBtn');
            const overlay = e.target.closest('#sidebarOverlay');
            
            if (hamburger) {
                e.preventDefault();
                document.getElementById('sidebar')?.classList.add('open');
                document.getElementById('sidebarOverlay')?.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            if (closeBtn || overlay) {
                document.getElementById('sidebar')?.classList.remove('open');
                document.getElementById('sidebarOverlay')?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('sidebar')?.classList.remove('open');
                document.getElementById('sidebarOverlay')?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Optimized scroll button
    function setupScrollButton() {
        const btn = document.getElementById('scrollBtn');
        if (!btn) return;
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                    btn.style.setProperty('--progress', scrollPercent);
                    btn.classList.toggle('scroll-at-top', window.scrollY < 50);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        btn.addEventListener('click', () => {
            const isAtTop = btn.classList.contains('scroll-at-top');
            window.scrollTo({
                top: isAtTop ? document.body.scrollHeight : 0,
                behavior: 'smooth'
            });
        });
    }

    // Debounced search
    function setupSearch() {
        const input = document.getElementById('searchInput');
        if (!input) return;
        
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const term = e.target.value;
            
            if (term.length < 3) {
                document.getElementById('liveSearchResults').innerHTML = '';
                return;
            }
            
            timeout = setTimeout(() => {
                fetch(`${ITUNES_API}?term=${encodeURIComponent(term)}&limit=5&entity=song`)
                    .then(r => r.json())
                    .then(data => {
                        const html = data.results.map(item => 
                            `<li><a href="${item.trackViewUrl || '#'}" target="_blank" rel="noopener">${escapeHtml(item.trackName)} - ${escapeHtml(item.artistName)}</a></li>`
                        ).join('');
                        document.getElementById('liveSearchResults').innerHTML = `<ul class="live-search-list">${html}</ul>`;
                    })
                    .catch(() => {});
            }, 300);
        });
    }

    // Observe sections for lazy loading
    function observeSections() {
        document.querySelectorAll('[data-loader]').forEach(el => {
            sectionObserver.observe(el);
            // Show spinner
            el.innerHTML = '<div class="loader minimal"><div class="loader-album"></div><div class="loader-album"></div><div class="loader-album"></div></div>';
        });
    }

    // ===== PAGE LOADERS =====
    window.loadTrending = async function() {
        const container = document.getElementById('trending-container');
        if (!container || container.classList.contains('loaded')) return;
        
        try {
            const cacheKey = 'trending';
            let data = cache.get(cacheKey);
            
            if (!data) {
                const response = await fetch(ITUNES_TOP);
                data = await response.json();
                cache.set(cacheKey, data);
            }
            
            const songs = data.feed.entry.slice(0, 8);
            container.innerHTML = songs.map(song => {
                const name = song['im:name'].label;
                const artist = song['im:artist'].label;
                const image = song['im:image'][2]?.label || song['im:image'][0]?.label;
                const year = new Date(song['im:releaseDate']?.label).getFullYear() || '2026';
                
                return `
                    <a class="music-item" href="${song.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                        <div class="item-container">
                            <div class="item-thumb">
                                <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy">
                            </div>
                            <div class="item-data">
                                <span class="track-title"><b>${escapeHtml(truncate(name, 50))}</b></span>
                                <div class="artist-name">${escapeHtml(artist)}</div>
                                <span class="item-meta"><b style="color:#ff0000">Released:</b> ${year}</span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
            container.classList.add('loaded');
        } catch (error) {
            container.innerHTML = '<div class="error-message">Unable to load</div>';
        }
    };

    window.loadLatest = async function() {
        const container = document.getElementById('latest-container');
        if (!container || container.classList.contains('loaded')) return;
        
        try {
            const cacheKey = 'latest';
            let data = cache.get(cacheKey);
            
            if (!data) {
                const response = await fetch(ITUNES_NEW);
                data = await response.json();
                cache.set(cacheKey, data);
            }
            
            const albums = data.feed.entry.slice(0, 8);
            container.innerHTML = albums.map(album => {
                const name = album['im:name'].label;
                const artist = album['im:artist'].label;
                const image = album['im:image'][2]?.label || album['im:image'][0]?.label;
                const year = new Date(album['im:releaseDate']?.label).getFullYear() || '2026';
                
                return `
                    <a class="music-item" href="${album.link?.attributes?.href || '#'}" target="_blank" rel="noopener">
                        <div class="item-container">
                            <div class="item-thumb">
                                <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy">
                            </div>
                            <div class="item-data">
                                <span class="track-title"><b>${escapeHtml(truncate(name, 50))}</b></span>
                                <div class="artist-name">${escapeHtml(artist)}</div>
                                <span class="item-meta"><b style="color:#ff0000">Released:</b> ${year}</span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
            container.classList.add('loaded');
        } catch (error) {
            container.innerHTML = '<div class="error-message">Unable to load</div>';
        }
    };

    window.loadPlaylists = async function() {
        const container = document.getElementById('playlists-container');
        if (!container || container.classList.contains('loaded')) return;
        
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
                const artist = item.artistName || 'Various';
                const image = item.artworkUrl100 || 'https://via.placeholder.com/80/9c27b0/ffffff?text=PLAYLIST';
                const tracks = item.trackCount || Math.floor(Math.random() * 50) + 20;
                
                return `
                    <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                        <div class="item-container">
                            <div class="item-thumb">
                                <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy">
                            </div>
                            <div class="item-data">
                                <span class="track-title"><b>${escapeHtml(truncate(name, 40))}</b> <span class="playlist-badge">Playlist</span></span>
                                <div class="artist-name">${escapeHtml(artist)}</div>
                                <span class="item-meta"><b style="color:#ff0000">${tracks} songs</b></span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
            container.classList.add('loaded');
        } catch (error) {
            container.innerHTML = '<div class="error-message">Unable to load</div>';
        }
    };

    // Similar optimized loaders for albums, eps, artists...
    window.loadAlbums = async function() {
        const container = document.getElementById('albums-container');
        if (!container || container.classList.contains('loaded')) return;
        
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
                const artist = item.artistName || 'Unknown';
                const image = item.artworkUrl100 || 'https://via.placeholder.com/80/4caf50/ffffff?text=ALBUM';
                const tracks = item.trackCount || Math.floor(Math.random() * 15) + 8;
                
                return `
                    <a class="music-item" href="${item.collectionViewUrl || '#'}" target="_blank" rel="noopener">
                        <div class="item-container">
                            <div class="item-thumb">
                                <img src="${image}" width="80" height="80" class="roundthumb" alt="${escapeHtml(name)}" loading="lazy">
                            </div>
                            <div class="item-data">
                                <span class="track-title"><b>${escapeHtml(truncate(name, 40))}</b> <span class="album-badge">Album</span></span>
                                <div class="artist-name">${escapeHtml(artist)}</div>
                                <span class="item-meta"><b style="color:#ff0000">${tracks} tracks</b></span>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
            container.classList.add('loaded');
        } catch (error) {
            container.innerHTML = '<div class="error-message">Unable to load</div>';
        }
    };

    // Helper functions
    function truncate(str, len) {
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

    // Make functions global
    window.closeSidebar = () => {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
    };

}, 0); // Defer entire script