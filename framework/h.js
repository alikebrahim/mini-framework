/**
 * Hyperscript-like function to create virtual DOM nodes.
 * @param {string} tag - The HTML tag name.
 * @param {object} [attrs={}] - An object containing attributes (props) for the element.
 * @param {(string|object|Array<string|object>)} [children=[]] - The children of the element. Can be text nodes (strings) or other virtual nodes.
 * @returns {object} A virtual DOM node representation.
 */
export function h(tag, attrs = {}, children = []) {
    // Handle function components (like TodoItem)
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

    // Flatten nested arrays of children and convert non-objects (like numbers) to strings
    const flatChildren = children.flat().map(child => {
        if (child === false) {
            return null; // Filter out false values from conditionals
        }
        if (typeof child !== 'object' && child !== null && child !== undefined) {
            return String(child); // Convert primitives to strings (text nodes)
        }
        return child; // Keep virtual nodes as objects
    }).filter(child => child !== null);

    return {
        tag,
        attrs,
        children: flatChildren,
    };
}

