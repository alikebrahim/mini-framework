let state = {};
let listeners = [];

/**
 * Returns the current application state.
 * @returns {object} The current state.
 */
export function getState() {
    return state;
}

/**
 * Updates the application state and notifies listeners.
 * @param {object|function} newState - An object with new state values or a function that receives the current state and returns the new state.
 */
export function setState(newState) {
    if (typeof newState === 'function') {
        const functionResult = newState(state);
        state = { ...state, ...functionResult };
    } else {
        state = { ...state, ...newState };
    }
    listeners.forEach(listener => listener(state));
}

/**
 * Subscribes a listener function to state changes.
 * @param {function} listener - The function to call when the state changes.
 * @returns {function} An unsubscribe function.
 */
export function subscribe(listener) {
    listeners.push(listener);
    // Return an unsubscribe function
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

/**
 * Initializes the state. Should be called once when the app starts.
 * @param {object} initialState - The initial state object.
 */
export function initState(initialState = {}) {
    state = initialState;
}

