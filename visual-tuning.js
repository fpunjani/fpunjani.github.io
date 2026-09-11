// Cached, spatially composed pixel reveal.
//
// Expensive image resampling happens only on initial render and meaningful resize.
// Scrolling only changes opacity on three already-rendered canvas layers, which keeps
// pixel boundaries stable and lets the browser composite the effect on the GPU.
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
                return {
                    canvas,
                    ctx: canvas.getContext('2d', { alpha: true })
                };
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

            // Mobile browser chrome causes small viewport-height changes while scrolling.
            // Stretch the cached bitmap through those tiny changes; only rerender for a
            // real layout change, orientation change, or meaningful height delta.
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
            ctx.drawImage(
                this.img,
                crop.srcX, crop.srcY, crop.srcW, crop.srcH,
                0, 0, targetW, targetH
            );
        }

        renderPixelLayer(layer, cssPixelSize, kind, crop, cssW, cssH, targetW, targetH) {
            const scaledW = Math.max(1, Math.ceil(cssW / cssPixelSize));
            const scaledH = Math.max(1, Math.ceil(cssH / cssPixelSize));

            if (this.smallBuffer.width !== scaledW) this.smallBuffer.width = scaledW;
            if (this.smallBuffer.height !== scaledH) this.smallBuffer.height = scaledH;

            this.smallCtx.clearRect(0, 0, scaledW, scaledH);
            this.smallCtx.imageSmoothingEnabled = true;
            this.smallCtx.drawImage(
                this.img,
                crop.srcX, crop.srcY, crop.srcW, crop.srcH,
                0, 0, scaledW, scaledH
            );

            const { ctx } = layer;
            ctx.clearRect(0, 0, targetW, targetH);
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.smallBuffer, 0, 0, scaledW, scaledH, 0, 0, targetW, targetH);
            ctx.restore();

            this.applySpatialMask(ctx, kind, targetW, targetH, cssW <= 800);
        }

        applySpatialMask(ctx, kind, w, h, mobile) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';

            if (mobile) {
                // On phones the reading area occupies most of the viewport. Keep the
                // centre substantially clearer while allowing texture at the edges.
                const horizontal = ctx.createLinearGradient(0, 0, w, 0);
                const levels = kind === 'coarse'
                    ? [0.52, 0.31, 0.22, 0.31, 0.48]
                    : kind === 'medium'
                        ? [0.46, 0.30, 0.22, 0.30, 0.42]
                        : [0.34, 0.25, 0.19, 0.25, 0.32];
                horizontal.addColorStop(0.00, `rgba(0,0,0,${levels[0]})`);
                horizontal.addColorStop(0.18, `rgba(0,0,0,${levels[1]})`);
                horizontal.addColorStop(0.50, `rgba(0,0,0,${levels[2]})`);
                horizontal.addColorStop(0.82, `rgba(0,0,0,${levels[3]})`);
                horizontal.addColorStop(1.00, `rgba(0,0,0,${levels[4]})`);
                ctx.fillStyle = horizontal;
                ctx.fillRect(0, 0, w, h);

                ctx.globalCompositeOperation = 'destination-in';
                const vertical = ctx.createLinearGradient(0, 0, 0, h);
                vertical.addColorStop(0.00, 'rgba(0,0,0,0.92)');
                vertical.addColorStop(0.22, 'rgba(0,0,0,0.72)');
                vertical.addColorStop(0.60, 'rgba(0,0,0,0.58)');
                vertical.addColorStop(1.00, 'rgba(0,0,0,0.76)');
                ctx.fillStyle = vertical;
                ctx.fillRect(0, 0, w, h);
            } else {
                // Desktop composition: the open left side can carry much stronger
                // pixel texture. The central/right reading column is carved clear,
                // with a little texture returning around the far-right silhouette.
                const horizontal = ctx.createLinearGradient(0, 0, w, 0);
                const levels = kind === 'coarse'
                    ? [0.98, 0.95, 0.78, 0.34, 0.14, 0.18, 0.36]
                    : kind === 'medium'
                        ? [0.86, 0.82, 0.68, 0.38, 0.20, 0.21, 0.30]
                        : [0.58, 0.56, 0.48, 0.31, 0.20, 0.20, 0.25];
                const stops = [0.00, 0.28, 0.40, 0.50, 0.63, 0.78, 1.00];
                stops.forEach((stop, index) => {
                    horizontal.addColorStop(stop, `rgba(0,0,0,${levels[index]})`);
                });
                ctx.fillStyle = horizontal;
                ctx.fillRect(0, 0, w, h);

                // Feather an additional reading-zone cutout. This has no hard edge;
                // it simply reduces texture where long-form copy sits.
                ctx.globalCompositeOperation = 'destination-out';
                const readingHole = ctx.createRadialGradient(
                    w * 0.64, h * 0.46, 0,
                    w * 0.64, h * 0.46, w * 0.42
                );
                const strength = kind === 'coarse' ? 0.70 : kind === 'medium' ? 0.48 : 0.28;
                readingHole.addColorStop(0.00, `rgba(0,0,0,${strength})`);
                readingHole.addColorStop(0.42, `rgba(0,0,0,${strength * 0.72})`);
                readingHole.addColorStop(0.76, `rgba(0,0,0,${strength * 0.22})`);
                readingHole.addColorStop(1.00, 'rgba(0,0,0,0)');
                ctx.fillStyle = readingHole;
                ctx.fillRect(0, 0, w, h);
            }

            ctx.restore();
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

            // Coarse pixels disappear early. Medium and fine texture survive longer
            // over the open image, giving the effect depth without obscuring copy.
            const coarseEnd = mobile ? 0.34 : 0.46;
            const mediumEnd = mobile ? 0.66 : 0.88;
            const fineEnd = mobile ? 0.96 : 1.28;

            const coarse = 1 - smoothstep(0.00, coarseEnd, units);
            const medium = 0.92 * (1 - smoothstep(0.06, mediumEnd, units));
            const fine = 0.72 * (1 - smoothstep(0.18, fineEnd, units));

            this.layers.coarse.canvas.style.opacity = coarse.toFixed(3);
            this.layers.medium.canvas.style.opacity = medium.toFixed(3);
            this.layers.fine.canvas.style.opacity = fine.toFixed(3);
        }

        // The base implementation's continuous redraw hooks are intentionally unused.
        // These methods remain only so inherited code cannot accidentally trigger the
        // old repixelation path.
        resize() {}
        computeScrollRange() {}
        updatePixelation() {
            this.updateLayerOpacities();
        }
        drawPixelated() {}
    };
})();