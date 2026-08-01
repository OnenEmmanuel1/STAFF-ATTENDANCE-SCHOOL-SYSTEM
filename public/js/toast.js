/**
 * Global Toast Notification Helper
 * Usage: showToast('Action completed successfully!', 'success');
 * Types: 'success' | 'error' | 'info' | 'warning'
 */
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-[-10px] opacity-0';

    let iconSvg = '';
    let bgClasses = '';

    switch (type) {
        case 'success':
            bgClasses = 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-500/10';
            iconSvg = `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
            break;
        case 'error':
            bgClasses = 'bg-slate-900 border-red-500/30 text-white shadow-red-500/10';
            iconSvg = `<svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
            break;
        case 'warning':
            bgClasses = 'bg-slate-900 border-amber-500/30 text-white shadow-amber-500/10';
            iconSvg = `<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>`;
            break;
        default: // info
            bgClasses = 'bg-slate-900 border-indigo-500/30 text-white shadow-indigo-500/10';
            iconSvg = `<svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
            break;
    }

    toast.className += ' ' + bgClasses;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            ${iconSvg}
            <span>${message}</span>
        </div>
        <button class="text-slate-400 hover:text-white text-base leading-none font-bold ml-4">&times;</button>
    `;

    toast.querySelector('button').onclick = () => removeToast(toast);

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-10px]', 'opacity-0');
    });

    const timer = setTimeout(() => {
        removeToast(toast);
    }, duration);

    function removeToast(elem) {
        clearTimeout(timer);
        elem.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => {
            if (elem.parentNode) elem.parentNode.removeChild(elem);
        }, 300);
    }
}
