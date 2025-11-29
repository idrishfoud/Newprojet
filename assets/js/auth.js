// ...existing code...
/* Auth0 SPA authentication integration (OAuth)
   - Replace AUTH0_DOMAIN and AUTH0_CLIENT_ID with your values
   - Gating example for the shop: hides products/cart until login
   - Persists session using localStorage for convenience in this demo */
(function(){
    const CONFIG = {
        domain: 'YOUR_AUTH0_DOMAIN',
        clientId: 'YOUR_AUTH0_CLIENT_ID',
        authorizationParams: {
            redirect_uri: window.location.origin
        },
        cacheLocation: 'localstorage',
    };

    const state = {
        client: null,
        isAuthenticated: false,
        user: null
    };

    function qs(sel){ return document.querySelector(sel); }
    function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

    function setElDisplay(el, show){
        if (!el) return;
        el.classList.toggle('auth-hidden', !show);
    }

    function getAuthWidget(){
        return document.getElementById('auth-widget');
    }

    function ensureWidget(){
        const host = getAuthWidget();
        if (!host) return null;
        if (!host.dataset.rendered) {
            host.innerHTML = `
                <button class="nav__auth button button--outline" id="auth-login" type="button">
                    <i class="ri-login-box-line"></i> Se connecter
                </button>
                <button class="nav__auth button button--ghost auth-hidden" id="auth-logout" type="button">
                    <i class="ri-logout-box-r-line"></i> Se déconnecter
                </button>
            `;
            host.dataset.rendered = 'true';
        }
        return host;
    }

    // Fallback renderer using localStorage (when Auth0 not configured / SDK blocked)
    function renderFallback(){
        const host = getAuthWidget();
        if (!host) return;
        const logged = localStorage.getItem("loggedIn") === "true";
        if (logged) {
            host.innerHTML = `
                <span class="nav__user" id="user-name">${localStorage.getItem("userEmail") || ''}</span>
                <button id="fallback-logout" class="button button--small">Déconnexion</button>
            `;
            const btn = document.getElementById('fallback-logout');
            if (btn) btn.addEventListener('click', () => {
                localStorage.removeItem("loggedIn");
                localStorage.removeItem("userEmail");
                window.location.reload();
            });
        } else {
            host.innerHTML = `<a href="connexion.html" class="button button--small">Connexion</a>`;
        }
        host.dataset.rendered = 'true';
    }

    async function updateUI(){
        ensureWidget();
        const loginBtn = qs('#auth-login');
        const logoutBtn = qs('#auth-logout');
        setElDisplay(loginBtn, !state.isAuthenticated);
        setElDisplay(logoutBtn, !!state.isAuthenticated);

        // Shop gating
        const guardNote = qs('#shop-guard');
        const shopGrid = qs('.shop__grid');
        const cart = qs('.cart');
        if (shopGrid || guardNote || cart) {
            const allow = state.isAuthenticated;
            setElDisplay(guardNote, !allow);
            setElDisplay(shopGrid, allow);
            setElDisplay(cart, allow);
        }

        // Optional: show user name
        const userEl = qs('#user-name');
        if (userEl) userEl.textContent = state.user?.name || localStorage.getItem("userEmail") || '';
    }

    function loadAuth0Sdk(){
        if (window.createAuth0Client) return Promise.resolve(true);
        return new Promise((resolve) => {
            const existing = document.querySelector('script[data-sdk="auth0-spa"]');
            if (existing) {
                existing.addEventListener('load', ()=> resolve(!!window.createAuth0Client));
                existing.addEventListener('error', ()=> resolve(false));
                return;
            }
            const s = document.createElement('script');
            s.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.5/auth0-spa-js.production.js';
            s.async = true;
            s.defer = true;
            s.dataset.sdk = 'auth0-spa';
            s.onload = ()=> resolve(!!window.createAuth0Client);
            s.onerror = ()=> resolve(false);
            document.head.appendChild(s);
        });
    }

    async function init(){
        ensureWidget();
        const sdkLoaded = await loadAuth0Sdk();
        if (!sdkLoaded) {
            console.warn('Auth0 SDK not loaded. Using local fallback (check network/adblock).');
            // populate state from localStorage for gating UI
            state.isAuthenticated = localStorage.getItem("loggedIn") === "true";
            state.user = state.isAuthenticated ? { name: localStorage.getItem("userEmail") } : null;
            renderFallback();
            return updateUI();
        }
        if (CONFIG.domain.includes('YOUR_') || CONFIG.clientId.includes('YOUR_')) {
            console.warn('Auth0 config placeholders detected. Using local fallback. Replace domain and clientId in assets/js/auth.js');
            state.isAuthenticated = localStorage.getItem("loggedIn") === "true";
            state.user = state.isAuthenticated ? { name: localStorage.getItem("userEmail") } : null;
            renderFallback();
            return updateUI();
        }
        state.client = await createAuth0Client(CONFIG);

        // Handle redirect callback
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            try {
                await state.client.handleRedirectCallback();
            } catch (e) {
                console.error('Auth0 redirect error', e);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        state.isAuthenticated = await state.client.isAuthenticated();
        state.user = state.isAuthenticated ? await state.client.getUser() : null;

        // Wire buttons
        const loginBtn = qs('#auth-login');
        const logoutBtn = qs('#auth-logout');
        if (loginBtn) loginBtn.addEventListener('click', ()=> state.client.loginWithRedirect());
        if (logoutBtn) logoutBtn.addEventListener('click', ()=> state.client.logout({ logoutParams: { returnTo: window.location.origin } }));

        updateUI();
    }

    // Expose for debugging
    window.AppAuth = { init, updateUI };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// ...existing code...