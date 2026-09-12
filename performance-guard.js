// Keep only the pixel-background redraw work to at most one call per animation frame.
// Lenis and all other listeners retain their original behavior.
(() => {
    const nativeAddEventListener = window.addEventListener.bind(window);

    window.addEventListener = function(type, listener, options) {
        if (typeof listener !== 'function') {
            return nativeAddEventListener(type, listener, options);
        }

        const source = Function.prototype.toString.call(listener);
        const isPixelBackgroundListener =
            (type === 'scroll' || type === 'resize') && source.includes('updatePixelation');

        if (!isPixelBackgroundListener) {
            return nativeAddEventListener(type, listener, options);
        }

        let framePending = false;
        let latestEvent;

        const throttledListener = function(event) {
            latestEvent = event;
            if (framePending) return;
            framePending = true;

            requestAnimationFrame(() => {
                framePending = false;
                listener.call(window, latestEvent);
            });
        };

        return nativeAddEventListener(type, throttledListener, options);
    };

    // Load the final Bawa/photo integration layer after the other DOMContentLoaded
    // handlers have appended their Bawa styles, so this remains the final visual pass.
    document.addEventListener('DOMContentLoaded', () => {
        window.setTimeout(() => {
            if (document.querySelector('link[data-bawa-scene-integration]')) return;
            const sceneStyles = document.createElement('link');
            sceneStyles.rel = 'stylesheet';
            sceneStyles.href = './bawa-scene-integration.css';
            sceneStyles.dataset.bawaSceneIntegration = '';
            document.head.appendChild(sceneStyles);
        }, 0);
    });
})();