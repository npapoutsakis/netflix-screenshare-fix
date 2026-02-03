(function() {
    try {
        // Check for toggle state (default to enabled if null)
        const isEnabled = localStorage.getItem('netflix-fix-enabled');
        if (isEnabled === 'false') {
            return;
        }
    } catch (e) {
        // Accessing localStorage might fail in some contexts, just ignore
    }

    function applyCompositing(video) {
        video.style.filter = "sepia(0%)";
        video.style.opacity = "0.9999";
        video.style.mixBlendMode = "normal";
    }

    const videoObserver = new MutationObserver((mutations) => {
        const video = document.querySelector('video');
        if (video) {
            applyCompositing(video);
        }
    });

    videoObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
