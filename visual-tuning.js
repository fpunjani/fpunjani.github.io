// Cached, spatially composed pixel reveal.
//
// Expensive image resampling happens only on initial render and meaningful resize.
// Scrolling only changes opacity on already-rendered layers. Pixel boundaries stay
// fixed, avoiding the shimmer caused by continuously changing the pixel grid.
(() => {
    if (typeof PixelateBackground === 'undefined') return;

    const BasePixelateBackground = PixelateBackground;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const smoothstep = (edge0, edge1, value) => {
        if (edge0 === edge1) return value >= edge1 ? 1 : 0;
        const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    };

    PixelateBackground = class PortfolioPixelateBackground extends BasePixelateBackground {
        constructor() {
            super();
            this.layers = null;
            this.renderDpr = 1;
            this.renderWidth = 0;
            this.renderHeight = 0;
            this.scrollFrame = 0;
            this.resizeFrame = 0;
            this.smallBuffer = document.createElement('canvas');
            this.smallCtx = this.smallBuffer.getContext('2d');
        }

        setup() {
            this.createLayers();
            this.renderLayers(true);
            this.updateLayerOpacities();

            window.addEventListener('scroll', () => this.scheduleOpacityUpdate(), { passive: true });
            window.addEventListener('resize', () => this.scheduleResize(), { passive: true });
        }

        createLayers() {
            if (this.layers) return;

            this.canvas.classList.add('bg-layer', 'bg-sharp');
            this.canvas.setAttribute('aria-hidden', 'true');

            const makeLayer = (name) => {
                const canvas = document.createElement('canvas');
                canvas.className = `bg-layer bg-${name}`;
                canvas.setAttribute('aria-hidden', 'true');
                this.container.appendChild(canvas);
                return { canvas, ctx: canvas.getContext('2d', { alpha: true }) };
            };

            this.layers = {
                sharp: { canvas: this.canvas, ctx: this.ctx },
                fine: makeLayer('fine'),
                medium: makeLayer('medium'),
                coarse: makeLayer('coarse')
            };
        }

        scheduleOpacityUpdate() {
            if (this.scrollFrame) return;
            this.scrollFrame = requestAnimationFrame(() => {
                this.scrollFrame = 0;
                this.updateLayerOpacities();
            });
        }

        scheduleResize() {
            if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = requestAnimationFrame(() => {
                this.resizeFrame = 0;
                this.renderLayers(false);
                this.updateLayerOpacities();
            });
        }

        renderLayers(force = false) {
            const cssW = Math.max(1, window.innerWidth);
            const cssH = Math.max(1, document.documentElement.clientHeight || window.innerHeight);
            const widthChanged = Math.abs(cssW - this.renderWidth) > 2;
            const heightChanged = Math.abs(cssH - this.renderHeight) > 140;
            if (!force && !widthChanged && !heightChanged) return;

            this.renderWidth = cssW;
            this.renderHeight = cssH;
            this.renderDpr = Math.min(window.devicePixelRatio || 1, cssW <= 800 ? 1.25 : 1.5);

            const pixelW = Math.max(1, Math.round(cssW * this.renderDpr));
            const pixelH = Math.max(1, Math.round(cssH * this.renderDpr));
            Object.values(this.layers).forEach(({ canvas }) => {
                canvas.width = pixelW;
                canvas.height = pixelH;
            });

            const crop = this.getCrop(pixelW, pixelH);
            this.renderSharp(crop, pixelW, pixelH);
            this.renderPixelLayer(this.layers.fine, 3, 'fine', crop, cssW, cssH, pixelW, pixelH);
            this.renderPixelLayer(this.layers.medium, 8, 'medium', crop, cssW, cssH, pixelW, pixelH);
            this.renderPixelLayer(this.layers.coarse, 18, 'coarse', crop, cssW, cssH, pixelW, pixelH);
        }

        getCrop(targetW, targetH) {
            const imgRatio = this.img.naturalWidth / this.img.naturalHeight;
            const canvasRatio = targetW / targetH;
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

        renderSharp(crop, targetW, targetH) {
            const { ctx } = this.layers.sharp;
            ctx.clearRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(this.img, crop.srcX, crop.srcY, crop.srcW, crop.srcH, 0, 0, targetW, targetH);
        }

        renderPixelLayer(layer, cssPixelSize, kind, crop, cssW, cssH, targetW, targetH) {
            const scaledW = Math.max(1, Math.ceil(cssW / cssPixelSize));
            const scaledH = Math.max(1, Math.ceil(cssH / cssPixelSize));

            if (this.smallBuffer.width !== scaledW) this.smallBuffer.width = scaledW;
            if (this.smallBuffer.height !== scaledH) this.smallBuffer.height = scaledH;

            this.smallCtx.clearRect(0, 0, scaledW, scaledH);
            this.smallCtx.imageSmoothingEnabled = true;
            this.smallCtx.drawImage(this.img, crop.srcX, crop.srcY, crop.srcW, crop.srcH, 0, 0, scaledW, scaledH);

            const { ctx } = layer;
            ctx.clearRect(0, 0, targetW, targetH);
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.smallBuffer, 0, 0, scaledW, scaledH, 0, 0, targetW, targetH);
            ctx.restore();

            this.applySpatialMask(ctx, kind, targetW, targetH, cssW <= 800);
        }

        punchSoftEllipse(ctx, cx, cy, rx, ry, strength) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.translate(cx, cy);
            ctx.scale(rx, ry);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0.00, `rgba(0,0,0,${strength})`);
            gradient.addColorStop(0.45, `rgba(0,0,0,${strength * 0.82})`);
            gradient.addColorStop(0.76, `rgba(0,0,0,${strength * 0.30})`);
            gradient.addColorStop(1.00, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        applySpatialMask(ctx, kind, w, h, mobile) {
            const baseAlpha = mobile
                ? (kind === 'coarse' ? 0.78 : kind === 'medium' ? 0.60 : 0.38)
                : (kind === 'coarse' ? 0.96 : kind === 'medium' ? 0.76 : 0.48);

            // Start with a broadly pixelated frame. Clear, feathered islands are then
            // carved around the subject and reading zones. This avoids any visible
            // left/right boundary while letting the open photograph carry the effect.
            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = `rgba(0,0,0,${baseAlpha})`;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();

            const bodyStrength = kind === 'coarse' ? 0.98 : kind === 'medium' ? 0.90 : 0.72;
            const readingStrength = kind === 'coarse' ? 0.50 : kind === 'medium' ? 0.38 : 0.22;

            if (mobile) {
                // The portrait crop moves the figure into the lower-right on phones.
                // Use overlapping soft ellipses instead of tracing an exact silhouette.
                this.punchSoftEllipse(ctx, w * 0.76, h * 0.72, w * 0.24, h * 0.25, bodyStrength);
                this.punchSoftEllipse(ctx, w * 0.68, h * 0.98, w * 0.31, h * 0.26, bodyStrength * 0.88);

                // Reading protection is intentionally lighter than subject protection,
                // so the page still feels pixelated without compromising legibility.
                this.punchSoftEllipse(ctx, w * 0.48, h * 0.43, w * 0.56, h * 0.40, readingStrength);
            } else {
                // Protect the visible figure first: head/upper body and lower torso.
                this.punchSoftEllipse(ctx, w * 0.745, h * 0.69, w * 0.145, h * 0.255, bodyStrength);
                this.punchSoftEllipse(ctx, w * 0.69, h * 0.98, w * 0.17, h * 0.26, bodyStrength * 0.90);

                // Broad, imperfect clearings around the two main reading masses. These
                // remain intentionally soft and asymmetric so the mask feels photographic.
                this.punchSoftEllipse(ctx, w * 0.625, h * 0.46, w * 0.34, h * 0.30, readingStrength);
                this.punchSoftEllipse(ctx, w * 0.30, h * 0.40, w * 0.20, h * 0.20, readingStrength * 0.58);
            }
        }

        updateLayerOpacities() {
            if (!this.layers) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.layers.coarse.canvas.style.opacity = '0';
                this.layers.medium.canvas.style.opacity = '0';
                this.layers.fine.canvas.style.opacity = '0';
                return;
            }

            const viewport = Math.max(window.innerHeight, 1);
            const units = window.scrollY / viewport;
            const mobile = window.innerWidth <= 800;

            // With the subject and reading areas protected, the surrounding pixels can
            // remain present longer without interfering with the content.
            const coarseEnd = mobile ? 0.42 : 0.58;
            const mediumEnd = mobile ? 0.84 : 1.05;
            const fineEnd = mobile ? 1.18 : 1.48;

            const coarse = 1 - smoothstep(0.00, coarseEnd, units);
            const medium = 0.94 * (1 - smoothstep(0.05, mediumEnd, units));
            const fine = 0.74 * (1 - smoothstep(0.16, fineEnd, units));

            this.layers.coarse.canvas.style.opacity = coarse.toFixed(3);
            this.layers.medium.canvas.style.opacity = medium.toFixed(3);
            this.layers.fine.canvas.style.opacity = fine.toFixed(3);
        }

        resize() {}
        computeScrollRange() {}
        updatePixelation() { this.updateLayerOpacities(); }
        drawPixelated() {}
    };
})();