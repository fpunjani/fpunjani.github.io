// Hero-scoped pixel-to-photo transition.
// The background starts abstract, resolves quickly through the opening viewport,
// then stops doing expensive redraw work once it is fully sharp.
(() => {
    if (typeof PixelateBackground === 'undefined') return;

    const BasePixelateBackground = PixelateBackground;

    PixelateBackground = class PortfolioPixelateBackground extends BasePixelateBackground {
        constructor() {
            super();
            this.maxPixelSize = 14; // CSS pixels, independent of devicePixelRatio.
            this.minPixelSize = 1;
            this.resolveDistance = Math.max(window.innerHeight * 0.82, 560);
            this.scrollRange = this.resolveDistance;
            this.lastProgress = -1;
            this.pixelBuffer = document.createElement('canvas');
            this.pixelCtx = this.pixelBuffer.getContext('2d');
        }

        computeScrollRange() {
            this.resolveDistance = Math.max(window.innerHeight * 0.82, 560);
            this.scrollRange = this.resolveDistance;
        }

        updatePixelation() {
            const progress = Math.min(Math.max(window.scrollY / this.scrollRange, 0), 1);

            // Once fully resolved, avoid repainting on every later scroll event.
            if (progress === 1 && this.lastProgress === 1) return;
            this.lastProgress = progress;

            // Smoothstep creates a gentle opening, then resolves decisively before Work.
            const smooth = progress * progress * (3 - 2 * progress);
            const pixelSize = this.maxPixelSize - (this.maxPixelSize - this.minPixelSize) * smooth;

            // Begin blending the true photo halfway through the hero and finish early.
            const fadeStart = 0.46;
            const fadeEnd = 0.88;
            const fadeProgress = Math.min(Math.max((progress - fadeStart) / (fadeEnd - fadeStart), 0), 1);
            const sharpAlpha = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);

            this.drawTransition(pixelSize, sharpAlpha);
        }

        drawTransition(pixelSize, sharpAlpha) {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const dpr = window.devicePixelRatio || 1;
            const cssW = w / dpr;
            const cssH = h / dpr;

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

            this.ctx.clearRect(0, 0, w, h);

            if (sharpAlpha < 0.995) {
                const scaledW = Math.max(1, Math.ceil(cssW / Math.max(pixelSize, 1)));
                const scaledH = Math.max(1, Math.ceil(cssH / Math.max(pixelSize, 1)));

                if (this.pixelBuffer.width !== scaledW) this.pixelBuffer.width = scaledW;
                if (this.pixelBuffer.height !== scaledH) this.pixelBuffer.height = scaledH;

                this.pixelCtx.clearRect(0, 0, scaledW, scaledH);
                this.pixelCtx.imageSmoothingEnabled = true;
                this.pixelCtx.drawImage(
                    this.img,
                    srcX, srcY, srcW, srcH,
                    0, 0, scaledW, scaledH
                );

                this.ctx.save();
                this.ctx.globalAlpha = 1;
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(this.pixelBuffer, 0, 0, scaledW, scaledH, 0, 0, w, h);
                this.ctx.restore();
            }

            if (sharpAlpha > 0.001) {
                this.ctx.save();
                this.ctx.globalAlpha = sharpAlpha;
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.drawImage(
                    this.img,
                    srcX, srcY, srcW, srcH,
                    0, 0, w, h
                );
                this.ctx.restore();
            }
        }
    };
})();