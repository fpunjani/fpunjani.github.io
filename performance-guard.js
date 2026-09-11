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
})();