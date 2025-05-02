let currentRoute = '';
let routeListeners = [];

/**
 * Gets the current route based on the URL hash.
 * @returns {string} The current route (e.g., '/', '/active', '/completed').
 */
function getRoute() {
    return window.location.hash.slice(1) || '/';
}

/**
 * Initializes the router and listens for hash changes.
 * Should be called once when the app starts.
 */
export function initRouter() {
    currentRoute = getRoute();
    window.addEventListener('hashchange', () => {
        const newRoute = getRoute();
        if (newRoute !== currentRoute) {
            currentRoute = newRoute;
            notifyRouteChange();
        }
    });
    // Initial notification
    notifyRouteChange();
}

/**
 * Subscribes a listener function to route changes.
 * @param {function} listener - The function to call when the route changes.
 * @returns {function} An unsubscribe function.
 */
export function onRouteChange(listener) {
    routeListeners.push(listener);
    // Immediately call the listener with the current route
    listener(currentRoute);
    // Return an unsubscribe function
    return () => {
        routeListeners = routeListeners.filter(l => l !== listener);
    };
}

/**
 * Notifies all subscribed listeners about a route change.
 */
function notifyRouteChange() {
    routeListeners.forEach(listener => listener(currentRoute));
}

/**
 * Navigates to a new route by changing the URL hash.
 * @param {string} path - The new route path (e.g., '/', '/active').
 */
export function navigate(path) {
    if (path !== getRoute()) {
        window.location.hash = path;
        // Note: The hashchange event listener will handle the update
    }
}

