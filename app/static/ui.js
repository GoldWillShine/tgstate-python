// Theme System
const Theme = {
    key: 'tgstate_theme_pref',
    
    init() {
        const pref = localStorage.getItem(this.key) || 'auto';
        this.set(pref, false);
        this.setupListeners();
    },
    
    set(mode, save = true) {
        if (save) localStorage.setItem(this.key, mode);
        
        let effectiveMode = mode;
        if (mode === 'auto') {
            effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', effectiveMode);
        
        // Update toggle UI if exists
        const toggles = document.querySelectorAll('.theme-toggle-btn');
        toggles.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: mode }));
    },
    
    setupListeners() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem(this.key) === 'auto') {
                this.set('auto', false);
            }
        });
    }
};

// Toast System
const Toast = {
    container: null,
    
    init() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    },
    
    show(message, type = 'success') {
        this.init();
        
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        
        const icon = type === 'success' 
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            
        el.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">${message}</div>
        `;
        
        this.container.appendChild(el);
        
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
};

// Utils
const Utils = {
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            Toast.show('已复制到剪贴板');
            return true;
        } catch (err) {
            Toast.show('复制失败', 'error');
            return false;
        }
    },
    
    setLoading(btn, isLoading) {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> 处理中...`;
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
});
