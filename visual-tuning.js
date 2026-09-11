// Uneven pixel-to-photo transition.
// The photograph is always present underneath the effect. Pixelation is strongest
// over the open-image side and deliberately lighter under the reading column.
(() => {
    if (typeof PixelateBackground === 'undefined') return;

    const BasePixelateBackground = PixelateBackground;

    PixelateBackground = class PortfolioPixelateBackground extends BasePixelateBackground {
        constructor() {
            super();
            this.minPixelSize = 1;
            this.maxPixelSize = window.innerWidth <= 800 ? 8 : 10;
            this.resolveDistance = Math.max(window.innerHeight * 0.60, 420);
            this.scrollRange = this.resolveDistance;
            this.lastProgress = -1;

            this.smallBuffer = document.createElement('canvas');
            this.smallCtx = this.smallBuffer.getContext('2d');
            this.pixelLayer = document.createElement('canvas');
            this.pixelLayerCtx = this.pixelLayer.getContext('2d');
        }

        computeScrollRange() {
            this.maxPixelSize = window.innerWidth <= 800 ? 8 : 10;
            this.resolveDistance = Math.max(window.innerHeight * 0.60, 420);
            this.scrollRange = this.resolveDistance;
        }

        updatePixelation() {
            const progress = Math.min(Math.max(window.scrollY / this.scrollRange, 0), 1);

            // Once the image has fully resolved, keep the sharp frame and stop doing
            // additional canvas work through the rest of the portfolio.
            if (progress === 1 && this.lastProgress === 1) return;
            this.lastProgress = progress;

            // Resolve decisively during the opening rather than dragging the mosaic
            // through Work and Projects.
            const resolve = 1 - Math.pow(1 - progress, 2.15);
            const pixelSize = this.maxPixelSize - (this.maxPixelSize - this.minPixelSize) * resolve;
            const pixelStrength = Math.pow(1 - progress, 1.35);

            this.drawUneven(pixelSize, pixelStrength);
        }

        getCrop() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const imgRatio = this.img.naturalWidth / this.img.naturalHeight;
            const canvasRatio = w / h;

            let srcX = 0;
            let srcY = 0;
            let srcW = this.img.naturalWidth;
            let srcH = this.img.naturalHeight;

            if (imgRatio > canvasRatio) {
                srcW = this.img.naturalHeight * canvasRatio;
                srcX = (this.img.naturalWidth - srcW) * 0.60;
            } else {
                srcH = this.img.naturalWidth / canvasRatio;
                srcY = (this.img.naturalHeight - srcH) * 0.79;
            }

            return { srcX, srcY, srcW, srcH };
        }

        drawUneven(pixelSize, pixelStrength) {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const dpr = window.devicePixelRatio || 1;
            const cssW = Math.max(1, w / dpr);
            const cssH = Math.max(1, h / dpr);
            const { srcX, srcY, srcW, srcH } = this.getCrop();

            this.ctx.clearRect(0, 0, w, h);

            // The true photograph is the base layer from frame one. This makes the
            // pixel effect feel like a veil that is lifting, instead of hiding the page.
            this.ctx.save();
            this.ctx.globalAlpha = 1;
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.drawImage(
                this.img,
                srcX, srcY, srcW, srcH,
                0, 0, w, h
            );
            this.ctx.restore();

            if (pixelStrength <= 0.002) return;

            const scaledW = Math.max(1, Math.ceil(cssW / Math.max(pixelSize, 1)));
            const scaledH = Math.max(1, Math.ceil(cssH / Math.max(pixelSize, 1)));

            if (this.smallBuffer.width !== scaledW) this.smallBuffer.width = scaledW;
            if (this.smallBuffer.height !== scaledH) this.smallBuffer.height = scaledH;
            if (this.pixelLayer.width !== w) this.pixelLayer.width = w;
            if (this.pixelLayer.height !== h) this.pixelLayer.height = h;

            this.smallCtx.clearRect(0, 0, scaledW, scaledH);
            this.smallCtx.imageSmoothingEnabled = true;
            this.smallCtx.drawImage(
                this.img,
                srcX, srcY, srcW, srcH,
                0, 0, scaledW, scaledH
            );

            const layerCtx = this.pixelLayerCtx;
            layerCtx.clearRect(0, 0, w, h);
            layerCtx.save();
            layerCtx.globalCompositeOperation = 'source-over';
            layerCtx.globalAlpha = 1;
            layerCtx.imageSmoothingEnabled = false;
            layerCtx.drawImage(
                this.smallBuffer,
                0, 0, scaledW, scaledH,
                0, 0, w, h
            );
            layerCtx.restore();

            // Mask the pixel layer. On desktop, the open left side keeps more texture
            // while the right reading column shows substantially more of the sharp photo.
            // On mobile, where copy spans nearly the full viewport, the entire effect is
            // lighter and becomes weakest through the center reading area.
            layerCtx.save();
            layerCtx.globalCompositeOperation = 'destination-in';

            let gradient;
            if (window.innerWidth <= 800) {
                gradient = layerCtx.createLinearGradient(0, 0, w, 0);
                gradient.addColorStop(0.00, `rgba(0,0,0,${0.62 * pixelStrength})`);
                gradient.addColorStop(0.18, `rgba(0,0,0,${0.52 * pixelStrength})`);
                gradient.addColorStop(0.52, `rgba(0,0,0,${0.34 * pixelStrength})`);
                gradient.addColorStop(0.82, `rgba(0,0,0,${0.42 * pixelStrength})`);
                gradient.addColorStop(1.00, `rgba(0,0,0,${0.52 * pixelStrength})`);
            } else {
                gradient = layerCtx.createLinearGradient(0, 0, w, 0);
                gradient.addColorStop(0.00, `rgba(0,0,0,${0.94 * pixelStrength})`);
                gradient.addColorStop(0.30, `rgba(0,0,0,${0.90 * pixelStrength})`);
                gradient.addColorStop(0.42, `rgba(0,0,0,${0.72 * pixelStrength})`);
                gradient.addColorStop(0.56, `rgba(0,0,0,${0.46 * pixelStrength})`);
                gradient.addColorStop(0.72, `rgba(0,0,0,${0.30 * pixelStrength})`);
                gradient.addColorStop(1.00, `rgba(0,0,0,${0.22 * pixelStrength})`);
            }

            layerCtx.fillStyle = gradient;
            layerCtx.fillRect(0, 0, w, h);
            layerCtx.restore();

            this.ctx.save();
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(this.pixelLayer, 0, 0);
            this.ctx.restore();
        }
    };
})();