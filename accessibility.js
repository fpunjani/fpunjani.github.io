document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('circular-reveal');
    if (!fab) return;

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