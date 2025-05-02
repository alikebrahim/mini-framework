/**
 * Renders a virtual DOM node into a real DOM container.
 * This is a basic implementation that replaces the container's content.
 * @param {object} vnode - The virtual DOM node (from h function) or a string (text node).
 * @param {HTMLElement} container - The real DOM element to render into.
 */
export function render(vnode, container) {
    // Store the focused element for later restoration if it exists
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
    
    // If there was a focused element, try to restore focus
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

/**
 * Mounts a virtual DOM node into a real DOM container.
 * @param {object|string} vnode - The virtual DOM node or a string.
 * @param {HTMLElement} parentEl - The parent real DOM element.
 */
function mount(vnode, parentEl) {
    // Handle text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        parentEl.appendChild(document.createTextNode(vnode));
        return;
    }

    // Skip null, undefined, or falsy nodes
    if (!vnode) {
        return;
    }

    // Skip if tag is not a string (this happens with invalid nodes)
    if (!vnode.tag || typeof vnode.tag !== 'string') {
        return;
    }

    // Create the real DOM element
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
                // Handle className for CSS classes
                el.setAttribute('class', value);
            } else if (key === 'htmlFor') {
                // Handle htmlFor for labels
                el.setAttribute('for', value);
            } else if (typeof value === 'boolean') {
                // Handle boolean attributes (e.g., checked, disabled)
                if (value) {
                    el.setAttribute(key, '');
                } else {
                    el.removeAttribute(key);
                }
            } else if (value != null) {
                // Set other attributes
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

    // Append the element to the parent
    parentEl.appendChild(el);
}

