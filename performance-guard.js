// Keep scroll-driven visuals to at most one redraw per animation frame.
// This leaves the existing image, crop, pixelation curve, overlay, and smooth-scroll feel unchanged.
(() => {
    const nativeAddEventListener = window.addEventListener.bind(window);

    window.addEventListener = function(type, listener, options) {
        const shouldThrottle = (type === 'scroll' || type === 'resize') && typeof listener === 'function';
        if (!shouldThrottle) {
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