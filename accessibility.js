document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('circular-reveal');
    if (!fab) return;

    // The control is now a native button. Stop the legacy anonymous key handler
    // and let the browser generate the standard click for Enter/Space.
    fab.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.stopImmediatePropagation();
        }
    }, true);

    const syncState = () => {
        fab.removeAttribute('aria-pressed');
        if (fab.dataset.state && fab.dataset.state !== 'idle') {
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
});