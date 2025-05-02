# Mini-Framework Tutorial: Building a Lightweight Front-End Framework

This tutorial explains the implementation details of our mini-framework, which provides core functionality for building modern web applications while remaining lightweight and easy to understand. We'll examine each module, explain how they work together, and discuss the design decisions behind the implementation.

## Table of Contents

1. [Overview](#overview)
2. [Virtual DOM (h.js)](#virtual-dom-hjs)
3. [Rendering (render.js)](#rendering-renderjs)
4. [State Management (state.js)](#state-management-statejs)
5. [Routing (router.js)](#routing-routerjs)
6. [Putting It All Together (index.js)](#putting-it-all-together-indexjs)
7. [Advanced Patterns](#advanced-patterns)

## Overview

Our mini-framework includes four essential modules that provide the foundation for building modern web applications:

1. **Virtual DOM (h.js)**: Creates JavaScript representations of DOM elements
2. **Rendering Engine (render.js)**: Converts virtual DOM into real DOM elements
3. **State Management (state.js)**: Provides a centralized state with subscription system
4. **Routing (router.js)**: Handles URL-based navigation

These modules can be used independently, but they're designed to work together efficiently. The framework focuses on simplicity and clarity over performance optimization, making it an excellent learning tool.

## Virtual DOM (h.js)

The virtual DOM implementation is centered around the `h()` function, which creates JavaScript objects representing DOM elements.

### Implementation Details

```javascript
export function h(tag, attrs = {}, children = []) {
    // Handle function components
    if (typeof tag === 'function') {
        return tag(attrs);
    }

    // Handle falsy values in conditional rendering
    if (!tag) {
        return null;
    }

    // Ensure children is always an array
    if (!Array.isArray(children)) {
        children = [children];
    }

    // Process children
    const flatChildren = children.flat().map(child => {
        if (child === false) {
            return null; // Filter out false values from conditionals
        }
        if (typeof child !== 'object' && child !== null && child !== undefined) {
            return String(child); // Convert primitives to strings
        }
        return child; // Keep virtual nodes as objects
    }).filter(child => child !== null);

    return {
        tag,
        attrs,
        children: flatChildren,
    };
}
```

### Key Concepts

1. **Hyperscript Function**: The `h()` function creates a lightweight virtual DOM node with a structure similar to:
   ```javascript
   {
     tag: 'div',
     attrs: { className: 'container' },
     children: [/* child nodes */]
   }
   ```

2. **Function Component Support**: When `tag` is a function, we call it with the attributes (props) and return its result. This enables component composition:
   ```javascript
   function Button(props) {
     return h('button', { ...props, className: 'btn' }, props.children);
   }
   
   // Usage
   h(Button, { onclick: handleClick }, 'Click me');
   ```

3. **Conditional Rendering**: The implementation properly handles conditionals using `&&` operator:
   ```javascript
   h('div', {}, [
     isLoggedIn && h('span', {}, 'Welcome back'),
     !isLoggedIn && h('a', { href: '/login' }, 'Login')
   ]);
   ```

4. **Child Normalization**: Children are flattened, normalized into strings when appropriate, and filtered to remove nulls and falsy values.

## Rendering (render.js)

The rendering module converts virtual DOM nodes into real DOM elements and handles updates.

### Implementation Details

```javascript
export function render(vnode, container) {
    // Store the focused element for later restoration
    const activeElement = document.activeElement;
    const activeElementId = activeElement && activeElement.id;
    const activeElementSelectionStart = activeElement && activeElement.selectionStart;
    const activeElementSelectionEnd = activeElement && activeElement.selectionEnd;
    
    // Clear the container
    container.innerHTML = '';
    
    if (!vnode) {
        return;
    }
    
    mount(vnode, container);
    
    // Restore focus if needed
    if (activeElementId) {
        const newActiveElement = document.getElementById(activeElementId);
        if (newActiveElement) {
            newActiveElement.focus();
            if (typeof activeElementSelectionStart === 'number' && 
                typeof activeElementSelectionEnd === 'number') {
                newActiveElement.setSelectionRange(activeElementSelectionStart, activeElementSelectionEnd);
            }
        }
    }
}

function mount(vnode, parentEl) {
    // Handle text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        parentEl.appendChild(document.createTextNode(vnode));
        return;
    }

    // Handle null/undefined
    if (!vnode) {
        return;
    }

    // Skip if tag is not a string (invalid nodes)
    if (!vnode.tag || typeof vnode.tag !== 'string') {
        return;
    }

    // Create the DOM element
    const el = document.createElement(vnode.tag);

    // Set attributes and event listeners
    if (vnode.attrs) {
        for (const key in vnode.attrs) {
            const value = vnode.attrs[key];
            if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.toLowerCase();
                
                // Special handling for dblclick event
                if (key === 'ondblclick') {
                    el.addEventListener('dblclick', value);
                } else {
                    el[eventName] = value;
                }
            } else if (key === 'className') {
                el.setAttribute('class', value);
            } else if (key === 'htmlFor') {
                el.setAttribute('for', value);
            } else if (typeof value === 'boolean') {
                if (value) {
                    el.setAttribute(key, '');
                } else {
                    el.removeAttribute(key);
                }
            } else if (value != null) {
                el.setAttribute(key, value);
            }
        }
    }

    // Mount children
    if (vnode.children) {
        vnode.children.filter(child => child !== null && child !== undefined).forEach(child => {
            mount(child, el);
        });
    }

    // Append to parent
    parentEl.appendChild(el);
}
```

### Key Concepts

1. **Simple Rendering Strategy**: Our implementation uses a simple 'replace everything' approach rather than a sophisticated diffing algorithm. While less efficient, it's much easier to understand.

2. **Focus Preservation**: To handle editing and form inputs properly, we save and restore focus state during rendering. This is important for maintaining a good user experience.

3. **Attribute Handling**: The implementation handles several special cases:
   - Event listeners (properties starting with 'on')
   - className (mapped to class attribute)
   - htmlFor (mapped to for attribute)
   - Boolean attributes (like checked, disabled)

4. **Child Processing**: Each child is recursively mounted to build the complete DOM tree.

5. **Special Event Handling**: Double-click events have special handling to work consistently across browsers.

## State Management (state.js)

The state management module provides a simple, centralized state store with a subscription mechanism.

### Implementation Details

```javascript
let state = {};
let listeners = [];

export function getState() {
    return state;
}

export function setState(newState) {
    if (typeof newState === 'function') {
        const functionResult = newState(state);
        state = { ...state, ...functionResult };
    } else {
        state = { ...state, ...newState };
    }
    listeners.forEach(listener => listener(state));
}

export function subscribe(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

export function initState(initialState = {}) {
    state = initialState;
}
```

### Key Concepts

1. **Centralized State**: All application state is stored in a single JavaScript object, making it easier to reason about the application's data flow.

2. **Immutable Updates**: State updates create a new state object rather than mutating the existing one, following the principles of immutable data management.

3. **Function-Based Updates**: The `setState` function accepts either an object or a function that receives the current state and returns updates, enabling complex state transitions that depend on previous state.

4. **Subscription System**: Components can subscribe to state changes to trigger re-renders or other side effects when state changes.

## Routing (router.js)

The routing module provides hash-based navigation for single-page applications.

### Implementation Details

```javascript
let currentRoute = '';
let routeListeners = [];

function getRoute() {
    return window.location.hash.slice(1) || '/';
}

export function initRouter() {
    currentRoute = getRoute();
    window.addEventListener('hashchange', () => {
        const newRoute = getRoute();
        if (newRoute !== currentRoute) {
            currentRoute = newRoute;
            notifyRouteChange();
        }
    });
    notifyRouteChange();
}

export function onRouteChange(listener) {
    routeListeners.push(listener);
    listener(currentRoute);
    return () => {
        routeListeners = routeListeners.filter(l => l !== listener);
    };
}

function notifyRouteChange() {
    routeListeners.forEach(listener => listener(currentRoute));
}

export function navigate(path) {
    if (path !== getRoute()) {
        window.location.hash = path;
    }
}
```

### Key Concepts

1. **Hash-Based Routing**: The router uses the URL hash (#) for navigation, which doesn't require server configuration and works on all browsers.

2. **Route Subscription**: Components can subscribe to route changes in a pattern similar to the state management system.

3. **Programmatic Navigation**: The `navigate` function allows changing routes programmatically, making it easy to trigger navigation from event handlers.

4. **Initial Route Notification**: When initialized, the router immediately notifies subscribers about the current route, ensuring components render correctly on page load.

## Putting It All Together (index.js)

The index.js file serves as the entry point for the framework, exporting all the necessary functions from the individual modules.

```javascript
// DOM Abstraction
export { h } from './h.js';
export { render } from './render.js';

// State Management
export { getState, setState, subscribe, initState } from './state.js';

// Routing
export { initRouter, onRouteChange, navigate } from './router.js';
```

This modular approach allows applications to import only the functionality they need.

## Advanced Patterns

While the framework is intentionally simple, it supports several advanced patterns commonly used in modern web applications:

### Component Composition

Components can be composed by returning other components:

```javascript
function Button(props) {
    return h('button', {
        className: 'button',
        ...props
    }, props.children);
}

function PrimaryButton(props) {
    return h(Button, {
        className: 'button primary',
        ...props
    }, props.children);
}
```

### Container/Presentational Pattern

You can separate data-fetching logic from rendering:

```javascript
// Container component (manages state)
function TodoListContainer() {
    const { todos } = getState();
    return h(TodoList, { todos });
}

// Presentational component (pure rendering)
function TodoList({ todos }) {
    return h('ul', {}, todos.map(todo =>
        h('li', { key: todo.id }, todo.title)
    ));
}
```

### State-Driven UI

The subscription pattern enables state-driven UI updates:

```javascript
// Set up initial render
function renderApp() {
    const state = getState();
    const view = h(App, { state });
    render(view, document.getElementById('root'));
}

// Subscribe to state changes
subscribe(renderApp);

// Initial render
renderApp();
```

### Route-Based Navigation

Combining routing and state creates a complete SPA experience:

```javascript
// Set up route handling
onRouteChange(route => {
    setState({ currentRoute: route });
});

// Initialize router
initRouter();

// Navigation component
function NavBar() {
    return h('nav', {}, [
        h('a', { href: '#/' }, 'Home'),
        h('a', { href: '#/about' }, 'About'),
        h('a', { href: '#/contact' }, 'Contact')
    ]);
}
```

## Conclusion

Our mini-framework provides the essential building blocks for modern web applications while keeping the code base small and approachable. By focusing on four key concerns—virtual DOM, rendering, state management, and routing—it offers a solid foundation that's easy to understand and extend.

The implementation prioritizes clarity over optimization, making it an excellent learning tool for understanding how front-end frameworks work under the hood. While it lacks many features of production frameworks (like performance optimizations, component lifecycle hooks, and middleware), it demonstrates the core architectural patterns that underpin most modern web frameworks.