/**
 * Custom event handling system that doesn't use addEventListener
 * Uses event delegation for better performance
 */

// Store all event handlers by element ID
const eventHandlers = new Map();
let elementIdCounter = 0;

// Global delegated event handlers
const delegatedHandlers = {};

/**
 * Initialize the event system
 */
export function initEventSystem() {
    // Set up delegated event handlers for common events
    const eventTypes = [
        'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
        'keydown', 'keyup', 'keypress', 'change', 'input', 'submit', 'focus', 'blur'
    ];
    
    eventTypes.forEach(eventType => {
        document.body['on' + eventType] = function(event) {
            handleDelegatedEvent(eventType, event);
        };
    });
}

/**
 * Handle delegated events
 */
function handleDelegatedEvent(eventType, event) {
    let target = event.target;
    
    // Bubble up through the DOM tree
    while (target && target !== document.body) {
        const elementId = target._eventId;
        if (elementId && eventHandlers.has(elementId)) {
            const handlers = eventHandlers.get(elementId);
            const handler = handlers[eventType];
            if (handler) {
                handler.call(target, event);
            }
        }
        target = target.parentElement;
    }
}

/**
 * Attach event handlers to an element
 */
export function attachEvents(element, events) {
    if (!element._eventId) {
        element._eventId = ++elementIdCounter;
    }
    
    const elementId = element._eventId;
    const handlers = eventHandlers.get(elementId) || {};
    
    // Store new handlers
    Object.keys(events).forEach(eventName => {
        if (eventName.startsWith('on')) {
            const eventType = eventName.substring(2).toLowerCase();
            handlers[eventType] = events[eventName];
        }
    });
    
    eventHandlers.set(elementId, handlers);
}

/**
 * Remove event handlers from an element
 */
export function removeEvents(element) {
    if (element._eventId) {
        eventHandlers.delete(element._eventId);
        delete element._eventId;
    }
}

/**
 * Update event handlers for an element
 */
export function updateEvents(element, newEvents, oldEvents) {
    if (!element._eventId && Object.keys(newEvents).some(k => k.startsWith('on'))) {
        element._eventId = ++elementIdCounter;
    }
    
    const elementId = element._eventId;
    if (!elementId) return;
    
    const handlers = eventHandlers.get(elementId) || {};
    
    // Remove old handlers that are not in new events
    Object.keys(oldEvents || {}).forEach(eventName => {
        if (eventName.startsWith('on') && !newEvents[eventName]) {
            const eventType = eventName.substring(2).toLowerCase();
            delete handlers[eventType];
        }
    });
    
    // Add/update new handlers
    Object.keys(newEvents || {}).forEach(eventName => {
        if (eventName.startsWith('on') && typeof newEvents[eventName] === 'function') {
            const eventType = eventName.substring(2).toLowerCase();
            handlers[eventType] = newEvents[eventName];
        }
    });
    
    if (Object.keys(handlers).length > 0) {
        eventHandlers.set(elementId, handlers);
    } else {
        eventHandlers.delete(elementId);
        delete element._eventId;
    }
}

// Initialize the event system when the module loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        // Use onload instead of addEventListener
        const oldOnload = window.onload;
        window.onload = function() {
            initEventSystem();
            if (typeof oldOnload === 'function') {
                oldOnload();
            }
        };
    } else {
        initEventSystem();
    }
}