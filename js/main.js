// ===== DEBUG VERSION - TEST API CONNECTION =====

console.log('🔵 main.js loaded - starting debug mode');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🟢 DOM ready, starting content load...');
    
    // First, test if we can access the API
    await testAPIConnection();
    
    // Then try to load content
    await loadAllContent();
});

// Test API connection first
async function testAPIConnection() {
    console.log('📡 Testing API connection...');
    
    try {
        const response = await fetch('/api/albums');
        console.log('📡 API response status:', response.status);
        
        const data = await response.json();
        console.log('📡 API data received:', data);
        
        // Log the structure to see what we're getting
        if (data.results) {
            console.log('📡 Data has "results" property with', data.results.length, 'items');
            console.log('📡 First album:', data.results[0]);
        } else if (Array.isArray(data)) {
            console.log('📡 Data is array with', data.length, 'items');
            console.log('📡 First album:', data[0]);
        } else {
            console.log('📡 Data structure:', Object.keys(data));
        }
        
        // Show a temporary message to confirm API works
        const container = document.getElementById('albums-container');
        if (container) {
            container.innerHTML = '<div style="background:green; color:white; padding:20px; text-align:center;">✅ API Connected! Found ' + (data.results ? data.results.length : data.length) + ' albums</div>';
        }
        
    } catch (error) {
        console.error('❌ API connection failed:', error);
        
        const container = document.getElementById('albums-container');
        if (container) {
            container.innerHTML = '<div style="background:red; color:white; padding:20px; text-align:center;">❌ API Error: ' + error.message + '</div>';
        }
    }
}

// Load all content with debugging
async function loadAllContent() {
    console.log('🔄 Loading all content sections...');
    
    // Try to load each section
    await loadAlbums();
    await loadLatestReleases();
    await loadTrending();
    await loadPlaylists();
    await loadEPs();
    await loadArtists();
    await loadGenres();
    
    console.log('✅ All content loading complete');
}

// ALBUMS SECTION - with detailed logging
async function loadAlbums() {
    console.log('📀 Loading albums...');
    const container = document.getElementById('albums-container');
    if (!container) {
        console.error('❌ albums-container not found in DOM');
        return;
    }
    
    container.innerHTML = '<div style="padding:20px; text-align:center;">Loading albums...</div>';
    
    try {
        const response = await fetch('/api/albums');
        console.log('📀 Albums API status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📀 Albums data received:', data);
        
        // Handle both response formats
        let albums = data.results || data;
        
        if (!albums || albums.length === 0) {
            container.innerHTML = '<div style="padding:20px; text-align:center;">No albums found</div>';
            return;
        }
        
        // Display albums as simple text first to verify data
        container.innerHTML = albums.slice(0, 6).map(album => `
            <div style="border:1px solid #ddd; padding:10px; margin:10px; border-radius:8px;">
                <strong>${album.title || 'Untitled'}</strong><br>
                Artist: ${album.artist_name || album.artist || 'Unknown'}<br>
                Tracks: ${album.track_count || 0}<br>
                ${album.cover_url ? `<img src="${album.cover_url}" width="50" height="50" style="border-radius:4px;">` : 'No image'}
            </div>
        `).join('');
        
        console.log('✅ Displayed', albums.length, 'albums');
        
    } catch (error) {
        console.error('❌ Error loading albums:', error);
        container.innerHTML = `<div style="padding:20px; text-align:center; color:red;">Error loading albums: ${error.message}</div>`;
    }
}

// LATEST RELEASES
async function loadLatestReleases() {
    console.log('🆕 Loading latest releases...');
    const container = document.getElementById('latest-container');
    if (!container) {
        console.error('❌ latest-container not found');
        return;
    }
    
    try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        let albums = data.results || data;
        
        const latest = [...albums].sort((a, b) => 
            new Date(b.release_date) - new Date(a.release_date)
        ).slice(0, 6);
        
        container.innerHTML = latest.map(album => `
            <div style="border:1px solid #ddd; padding:10px; margin:10px; border-radius:8px;">
                <strong>🎵 ${album.title}</strong><br>
                ${album.artist_name || album.artist}<br>
                ${album.release_date ? new Date(album.release_date).getFullYear() : 'TBA'}
            </div>
        `).join('');
        
        console.log('✅ Displayed', latest.length, 'latest releases');
        
    } catch (error) {
        console.error('❌ Error loading latest:', error);
        container.innerHTML = `<div style="padding:20px;">Error: ${error.message}</div>`;
    }
}

// TRENDING
async function loadTrending() {
    console.log('🔥 Loading trending...');
    const container = document.getElementById('trending-container');
    if (!container) return;
    
    try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        let albums = data.results || data;
        
        const trending = albums.slice(0, 6);
        
        container.innerHTML = trending.map(album => `
            <div style="border:1px solid #ddd; padding:10px; margin:10px; border-radius:8px;">
                <strong>🔥 ${album.title}</strong><br>
                ${album.artist_name || album.artist}
            </div>
        `).join('');
        
        console.log('✅ Displayed trending');
        
    } catch (error) {
        console.error('❌ Error loading trending:', error);
        container.innerHTML = `<div style="padding:20px;">Error: ${error.message}</div>`;
    }
}

// PLAYLISTS (placeholder until endpoint exists)
async function loadPlaylists() {
    console.log('📋 Loading playlists...');
    const container = document.getElementById('playlists-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">📋 Playlists - Coming Soon</div>';
    console.log('⚠️ Playlists endpoint not configured yet');
}

// EPS
async function loadEPs() {
    console.log('🎼 Loading EPs...');
    const container = document.getElementById('eps-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">🎼 EPs - Coming Soon</div>';
    console.log('⚠️ EPs endpoint not configured yet');
}

// ARTISTS
async function loadArtists() {
    console.log('🎤 Loading artists...');
    const container = document.getElementById('artists-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">🎤 Artists - Coming Soon</div>';
    console.log('⚠️ Artists endpoint not configured yet');
}

// GENRES
async function loadGenres() {
    console.log('🎸 Loading genres...');
    const container = document.getElementById('genres-container');
    if (!container) return;
    
    container.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">🎸 Genres - Coming Soon</div>';
    console.log('⚠️ Genres endpoint not configured yet');
}

// Header/Footer loader
async function loadHeaderAndFooter() {
    console.log('📄 Loading header/footer...');
    try {
        const [headerData, footerData] = await Promise.all([
            fetch('/header.html').then(r => r.text()),
            fetch('/footer.html').then(r => r.text())
        ]);
        
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');
        
        if (headerPlaceholder) headerPlaceholder.innerHTML = headerData;
        if (footerPlaceholder) footerPlaceholder.innerHTML = footerData;
        
        console.log('✅ Header/footer loaded');
    } catch (error) {
        console.log('⚠️ Header/footer not found:', error);
    }
}

// Initialize header/footer
loadHeaderAndFooter();

// Simple scroll button
function initializeScrollButton() {
    const scrollButton = document.getElementById('scrollBtn');
    if (scrollButton) {
        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
initializeScrollButton();

// Make global functions available
window.searchByGenre = function(genre) {
    alert(`Browse ${genre} music - Coming soon!`);
    return false;
};
window.loadMore = function() {
    alert('More content coming soon!');
    return false;
};
window.closeSidebar = function() {
    console.log('Sidebar close - implement if needed');
};