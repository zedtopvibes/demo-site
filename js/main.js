async function loadCompilations() {
    const container = document.getElementById('compilations-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading compilations...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/compilations`);
        const compilations = await response.json();
        
        if (!compilations || compilations.length === 0) {
            container.innerHTML = '<div class="error-message">No compilations found</div>';
            return;
        }
        
        container.innerHTML = compilations.slice(0, 6).map(compilation => `
            <a href="/compilation/${compilation.slug}" class="music-item">
                <div class="item-container">
                    <div class="item-thumb">
                        <img src="${getPlaylistImage(compilation)}" 
                             width="80" height="80" 
                             class="roundthumb" 
                             alt="${escapeHtml(compilation.title)}"
                             data-type="playlist"
                             onerror="handleImageError(this)">
                    </div>
                    <div class="item-data">
                        <span class="track-title"><b>${escapeHtml(compilation.title)}</b> <span class="compilation-badge">Compilation</span></span>
                        <div class="artist-name">Various Artists</div>
                        <span class="item-meta"><b style="color:#ff0000">${compilation.item_count || 0} items</b></span>
                    </div>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Error loading compilations:', error);
        container.innerHTML = '<div class="error-message">Compilations unavailable</div>';
    }
}