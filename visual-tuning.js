// Visual tuning for the existing pixel-to-photo background.
// Keeps the original crop, scroll easing, and interaction while starting less abstract.
(() => {
    if (typeof PixelateBackground === 'undefined') return;

    const BasePixelateBackground = PixelateBackground;

    PixelateBackground = class PortfolioPixelateBackground extends BasePixelateBackground {
        constructor() {
            super();
            this.maxPixelSize = 36;
            this.minPixelSize = 1;
        }

        updatePixelation() {
            const scrollY = window.scrollY;
            const progress = Math.min(scrollY / this.scrollRange, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const pixelSize = Math.max(
                this.minPixelSize,
                this.maxPixelSize - (this.maxPixelSize - this.minPixelSize) * eased
            );

            // The readability treatment is handled in CSS and should stay stable
            // instead of darkening the photograph as the visitor scrolls.
            this.drawPixelated(pixelSize);
        }
    };
})();