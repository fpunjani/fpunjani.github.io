// Final spatial-mask refinement: protect the subject with broad, overlapping soft
// pockets so the body feels naturally clearer without tracing a visible silhouette.
(() => {
    if (typeof PixelateBackground === 'undefined') return;

    PixelateBackground.prototype.applySpatialMask = function(ctx, kind, w, h, mobile) {
        const baseAlpha = mobile
            ? (kind === 'coarse' ? 0.78 : kind === 'medium' ? 0.60 : 0.38)
            : (kind === 'coarse' ? 0.96 : kind === 'medium' ? 0.76 : 0.48);

        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = `rgba(0,0,0,${baseAlpha})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        const bodyStrength = kind === 'coarse' ? 0.90 : kind === 'medium' ? 0.80 : 0.60;
        const readingStrength = kind === 'coarse' ? 0.46 : kind === 'medium' ? 0.33 : 0.18;

        if (mobile) {
            // Broad overlapping pockets around head, shoulders and lower body. These are
            // intentionally oversized and offset so there is no readable mask outline.
            this.punchSoftEllipse(ctx, w * 0.76, h * 0.70, w * 0.29, h * 0.31, bodyStrength);
            this.punchSoftEllipse(ctx, w * 0.67, h * 0.91, w * 0.35, h * 0.31, bodyStrength * 0.84);
            this.punchSoftEllipse(ctx, w * 0.70, h * 0.56, w * 0.27, h * 0.19, bodyStrength * 0.58);

            // Keep the main mobile reading mass calmer without making a rectangular zone.
            this.punchSoftEllipse(ctx, w * 0.46, h * 0.40, w * 0.62, h * 0.43, readingStrength);
        } else {
            // Subject protection extends beyond the visible silhouette on purpose.
            this.punchSoftEllipse(ctx, w * 0.75, h * 0.69, w * 0.19, h * 0.30, bodyStrength);
            this.punchSoftEllipse(ctx, w * 0.69, h * 0.97, w * 0.22, h * 0.30, bodyStrength * 0.84);
            this.punchSoftEllipse(ctx, w * 0.70, h * 0.54, w * 0.20, h * 0.18, bodyStrength * 0.58);

            // Reading clearings stay weaker than the subject clearing and are deliberately
            // broad/asymmetric so the open sky and water still carry the stronger effect.
            this.punchSoftEllipse(ctx, w * 0.63, h * 0.44, w * 0.37, h * 0.32, readingStrength);
            this.punchSoftEllipse(ctx, w * 0.29, h * 0.39, w * 0.22, h * 0.22, readingStrength * 0.48);
        }
    };
})();