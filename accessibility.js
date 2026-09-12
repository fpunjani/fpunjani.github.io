document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('link[data-bawa-object-v2]')) {
        const bawaStyles = document.createElement('link');
        bawaStyles.rel = 'stylesheet';
        bawaStyles.href = './bawa-object-v2.css';
        bawaStyles.dataset.bawaObjectV2 = '';
        document.head.appendChild(bawaStyles);
    }

    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = 'Farish<br>Punjani';
        heroTitle.setAttribute('aria-label', 'Farish Punjani');
    }

    const fab = document.getElementById('circular-reveal');

    if (fab) {
        const orbit = fab.querySelector('.portal-orbit');
        if (orbit) orbit.setAttribute('aria-hidden', 'true');

        const oldLabel = fab.querySelector('.portal-label');
        if (oldLabel) oldLabel.remove();

        fab.classList.add('bawa-firecracker-object');
        fab.setAttribute('aria-label', 'Light the fuse — Bawa ki Duniya');

        // Remove the previous side-by-side comparison wrapper if it exists.
        const oldCluster = fab.closest('.bawa-compare-cluster');
        if (oldCluster) {
            oldCluster.parentNode.insertBefore(fab, oldCluster);
            oldCluster.remove();
        }
        document.querySelectorAll('.bawa-launch-tag').forEach((node) => node.remove());

        // Add physical matchbox details without touching the existing click target.
        if (!fab.querySelector('.bawa-box-tray')) {
            const tray = document.createElement('span');
            tray.className = 'bawa-box-tray';
            tray.setAttribute('aria-hidden', 'true');
            fab.appendChild(tray);
        }

        if (!fab.querySelector('.bawa-box-striker')) {
            const striker = document.createElement('span');
            striker.className = 'bawa-box-striker';
            striker.setAttribute('aria-hidden', 'true');
            fab.appendChild(striker);
        }

        const centerInner = fab.querySelector('.circular-center-inner');
        if (centerInner && !centerInner.querySelector('.bawa-box-emblem')) {
            const emblem = document.createElement('span');
            emblem.className = 'bawa-box-emblem';
            emblem.setAttribute('aria-hidden', 'true');
            emblem.innerHTML = '<span>✦</span>';
            centerInner.appendChild(emblem);
        }

        if (!fab.querySelector('.bawa-fuse-light')) {
            const light = document.createElement('span');
            light.className = 'bawa-fuse-light';
            light.setAttribute('aria-hidden', 'true');
            light.innerHTML = '<span class="bawa-fuse-core"></span><span class="bawa-fuse-spark bawa-fuse-spark-a"></span><span class="bawa-fuse-spark bawa-fuse-spark-b"></span><span class="bawa-fuse-spark bawa-fuse-spark-c"></span>';
            fab.appendChild(light);
        }

        // Stage = fixed position + shadow. Drift wrapper = slow idle movement.
        // Button = cursor tilt + original click wiring.
        let shell = fab.closest('.bawa-float-shell');
        if (!shell) {
            shell = document.createElement('div');
            shell.className = 'bawa-float-shell';
            fab.parentNode.insertBefore(shell, fab);
            shell.appendChild(fab);
        }

        let drift = fab.closest('.bawa-float-body');
        if (!drift) {
            drift = document.createElement('div');
            drift.className = 'bawa-float-body';
            fab.parentNode.insertBefore(drift, fab);
            drift.appendChild(fab);
        }

        // Native button keyboard semantics; stop the legacy anonymous handler
        // from firing twice for Enter/Space.
        fab.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.stopImmediatePropagation();
            }
        }, true);

        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (finePointer.matches && !reducedMotion.matches) {
            fab.addEventListener('pointermove', (event) => {
                const rect = fab.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                fab.style.setProperty('--bawa-ry', `${(x * 8).toFixed(2)}deg`);
                fab.style.setProperty('--bawa-rx', `${(-y * 7).toFixed(2)}deg`);
                shell.style.setProperty('--shadow-x', `${(x * -8).toFixed(1)}px`);
            });

            fab.addEventListener('pointerleave', () => {
                fab.style.removeProperty('--bawa-rx');
                fab.style.removeProperty('--bawa-ry');
                shell.style.removeProperty('--shadow-x');
            });
        }

        const syncState = () => {
            fab.removeAttribute('aria-pressed');
            const state = fab.dataset.state || 'idle';
            shell.dataset.state = state;

            if (state !== 'idle') {
                fab.setAttribute('aria-busy', 'true');
            } else {
                fab.removeAttribute('aria-busy');
            }
        };

        syncState();

        const observer = new MutationObserver(syncState);
        observer.observe(fab, {
            attributes: true,
            attributeFilter: ['data-state', 'aria-pressed']
        });
    }

    // Preserve the existing email contact without storing the full address in the page markup.
    const contactLinks = document.querySelector('.contact-links');
    if (contactLinks && !contactLinks.querySelector('[data-email-link]')) {
        const localPart = 'farishpunjani';
        const domain = 'gmail.com';
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${localPart}@${domain}`;
        emailLink.className = 'contact-link';
        emailLink.dataset.emailLink = '';
        emailLink.innerHTML = 'Send a pigeon <span aria-hidden="true">↗</span>';
        contactLinks.prepend(emailLink);
    }
});