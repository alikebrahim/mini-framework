# Building Your Own JavaScript Framework - A Hands-On Journey

This guide will walk you through building a JavaScript framework step by step. We'll start simple and add features only when we discover we need them. By the end, you'll understand not just HOW frameworks work, but WHY they work that way.

## What You'll Learn

As someone with basic programming knowledge but new to JavaScript, you'll learn:
- JavaScript fundamentals through practical application
- Why frameworks exist and what problems they solve
- How to build each core feature incrementally
- The reasoning behind framework design decisions

## Prerequisites

You should understand:
- Basic programming concepts (variables, functions, loops)
- Basic HTML structure
- How to open files in a browser

No JavaScript knowledge required - we'll learn as we go!

## Our Approach

We'll build our framework like a real project:
1. Start with the simplest possible code
2. Test it and discover problems
3. Fix those problems, learning concepts as needed
4. Repeat until we have a complete framework

Let's begin!

---

## Chapter 1: Creating Elements with JavaScript

### Starting Point: The Problem

Let's say we want to create a simple todo list. Without a framework, here's what we'd write:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Todo List - No Framework</title>
</head>
<body>
    <div id="app"></div>
    
    <script>
        // Creating elements manually
        const app = document.getElementById('app');
        
        const title = document.createElement('h1');
        title.textContent = 'My Todo List';
        app.appendChild(title);
        
        const list = document.createElement('ul');
        app.appendChild(list);
        
        const item1 = document.createElement('li');
        item1.textContent = 'Learn JavaScript';
        list.appendChild(item1);
        
        const item2 = document.createElement('li');
        item2.textContent = 'Build a framework';
        list.appendChild(item2);
    </script>
</body>
</html>
```

**Problems with this approach:**
- Repetitive code
- Hard to visualize the structure
- Tedious to write
- Easy to make mistakes

### Our First Solution: The h() Function (Version 1)

Let's create a helper function to make this easier. Create a new file called `framework/h.js`:

```javascript
// h.js - Version 1: The simplest possible implementation
export function h(tag, attrs, children) {
    return {
        tag: tag,
        attrs: attrs,
        children: children
    };
}
```

**New JavaScript concepts introduced:**
- `export`: Makes this function available to other files
- `function`: Declares a reusable piece of code
- `return`: Sends a value back to the caller
- Objects `{}`: Collections of key-value pairs

Now create a test file `test-v1.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Testing h() - Version 1</title>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { h } from './framework/h.js';
        
        // Now we can describe our UI as data!
        const myApp = h('div', { className: 'container' }, [
            h('h1', {}, 'My Todo List'),
            h('ul', {}, [
                h('li', {}, 'Learn JavaScript'),
                h('li', {}, 'Build a framework')
            ])
        ]);
        
        console.log('Our virtual DOM:', myApp);
    </script>
</body>
</html>
```

**New concepts:**
- `import`: Brings in code from another file
- `type="module"`: Tells browser this script uses modern JavaScript modules
- Template literals: We're creating a "description" of our UI

Open this in your browser and check the console. You'll see a JavaScript object that describes your UI!

### Discovering Problem #1: Inconsistent Children

Let's try something slightly different:

```javascript
// Test: What if we have just one child?
const singleChild = h('div', {}, h('p', {}, 'Hello'));
console.log('Single child:', singleChild);
// Problem: children is not an array!

// Test: What if we forget children?
const noChildren = h('div', {});
console.log('No children:', noChildren);
// Problem: children is undefined!
```

### h() Version 2: Handling Edge Cases

Let's fix these issues in `h.js`:

```javascript
// h.js - Version 2: Handle different input types
export function h(tag, attrs = {}, children = []) {
    // Ensure children is always an array
    if (!Array.isArray(children)) {
        children = [children];
    }
    
    return {
        tag: tag,
        attrs: attrs,
        children: children
    };
}
```

**New concepts:**
- Default parameters `= {}`: Provides a default value if none given
- `Array.isArray()`: Checks if something is an array
- `if` statement: Conditional execution

Test again - now single children and missing children work correctly!

### Discovering Problem #2: Nested Arrays

Here's a common pattern that breaks:

```javascript
// When using map to create lists
const items = ['Apple', 'Banana', 'Orange'];
const list = h('ul', {}, [
    items.map(item => h('li', {}, item))
]);
console.log('List with map:', list);
// Problem: children is [[li, li, li]] instead of [li, li, li]
```

**Understanding the problem:**
- `map()` returns an array
- We put that array inside another array `[ ]`
- Result: nested arrays!

### h() Version 3: Flattening Arrays

```javascript
// h.js - Version 3: Flatten nested arrays
export function h(tag, attrs = {}, children = []) {
    // Ensure children is always an array
    if (!Array.isArray(children)) {
        children = [children];
    }
    
    // Flatten any nested arrays
    children = children.flat();
    
    return {
        tag: tag,
        attrs: attrs,
        children: children
    };
}
```

**New concept:**
- `array.flat()`: Removes one level of nesting from arrays

Now our map example works correctly!

### Discovering Problem #3: Numbers and Booleans

What happens with these cases?

```javascript
// Numbers as children
const counter = h('div', {}, [
    h('h1', {}, 'Count: '),
    42  // A number, not a string!
]);

// Conditional rendering
const showMessage = false;
const conditional = h('div', {}, [
    h('p', {}, 'Always shown'),
    showMessage && h('p', {}, 'Sometimes shown')  // Returns false!
]);
```

### h() Final Version: Complete Implementation

Here's our complete `h.js` that handles all edge cases:

```javascript
// h.js - Final Version
export function h(tag, attrs = {}, children = []) {
    // Handle function components (we'll use this later)
    if (typeof tag === 'function') {
        return tag(attrs);
    }
    
    // Ensure children is always an array
    if (!Array.isArray(children)) {
        children = [children];
    }
    
    // Flatten nested arrays and handle edge cases
    const flatChildren = children.flat().map(child => {
        // Remove boolean false from conditional rendering
        if (child === false || child === null || child === undefined) {
            return null;
        }
        // Convert numbers to strings
        if (typeof child === 'number') {
            return String(child);
        }
        return child;
    }).filter(child => child !== null);
    
    return {
        tag,
        attrs,
        children: flatChildren,
    };
}
```

### Test Everything!

Create `test-h-complete.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Testing h() - Complete</title>
</head>
<body>
    <script type="module">
        import { h } from './framework/h.js';
        
        console.log('=== Testing h() Function ===');
        
        // Test 1: Basic usage
        const basic = h('div', { className: 'test' }, 'Hello');
        console.log('1. Basic:', basic);
        
        // Test 2: Nested elements
        const nested = h('div', {}, [
            h('h1', {}, 'Title'),
            h('p', {}, 'Paragraph')
        ]);
        console.log('2. Nested:', nested);
        
        // Test 3: Using map (tests flattening)
        const items = ['Apple', 'Banana', 'Orange'];
        const list = h('ul', {}, [
            items.map(item => h('li', {}, item))
        ]);
        console.log('3. List (should be flat):', list);
        console.log('   Children length:', list.children.length); // Should be 3, not 1
        
        // Test 4: Numbers as children
        const withNumbers = h('div', {}, [
            'Count: ',
            42,
            ' items'
        ]);
        console.log('4. With numbers:', withNumbers);
        
        // Test 5: Conditional rendering
        const showExtra = false;
        const conditional = h('div', {}, [
            h('p', {}, 'Always shown'),
            showExtra && h('p', {}, 'Extra info'),
            showExtra || h('p', {}, 'Fallback')
        ]);
        console.log('5. Conditional (should have 2 children):', conditional);
    </script>
</body>
</html>
```

**What we learned:**
- How to create a function that describes UI as data
- JavaScript modules and imports
- Handling different data types
- Array manipulation with flat() and filter()
- Why edge cases matter

---

## Chapter 2: Turning Virtual DOM into Real DOM

### The Problem

We can describe our UI, but it's just data. We need to turn it into real HTML elements!

### render() Version 1: Basic Implementation

Create `framework/render.js`:

```javascript
// render.js - Version 1: Basic rendering
export function render(vnode, container) {
    // Clear the container
    container.innerHTML = '';
    
    // Create and append the DOM element
    const element = createDomElement(vnode);
    container.appendChild(element);
}

function createDomElement(vnode) {
    // Handle text nodes
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }
    
    // Create the element
    const element = document.createElement(vnode.tag);
    
    // Add attributes
    Object.entries(vnode.attrs || {}).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    // Add children
    vnode.children.forEach(child => {
        const childElement = createDomElement(child);
        element.appendChild(childElement);
    });
    
    return element;
}
```

**New JavaScript concepts:**
- `document.createElement()`: Creates a DOM element
- `document.createTextNode()`: Creates a text node
- `Object.entries()`: Converts object to array of [key, value] pairs
- `forEach()`: Loops through array elements
- Destructuring `[key, value]`: Extracts values from arrays

### Test It!

Create `test-render-v1.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Testing render() - Version 1</title>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { h } from './framework/h.js';
        import { render } from './framework/render.js';
        
        // Create our app
        const app = h('div', { id: 'container' }, [
            h('h1', {}, 'My First Render!'),
            h('p', {}, 'The framework is working!'),
            h('ul', {}, [
                h('li', {}, 'First item'),
                h('li', {}, 'Second item')
            ])
        ]);
        
        // Render it!
        render(app, document.getElementById('app'));
        
        // Test update after 2 seconds
        setTimeout(() => {
            const updated = h('div', { id: 'container' }, [
                h('h1', { style: 'color: green' }, 'Updated!'),
                h('p', {}, 'The whole DOM was replaced!')
            ]);
            render(updated, document.getElementById('app'));
        }, 2000);
    </script>
</body>
</html>
```

It works! But...

### Discovering the Problem: Lost Focus and State

Add this test:

```javascript
// Add an input field
const appWithInput = h('div', {}, [
    h('h1', {}, 'Type something:'),
    h('input', { type: 'text', placeholder: 'Type here...' }),
    h('p', {}, 'Watch what happens when we re-render...')
]);

render(appWithInput, document.getElementById('app'));

// Re-render every 2 seconds
setInterval(() => {
    render(appWithInput, document.getElementById('app'));
    console.log('Re-rendered! Did you lose focus?');
}, 2000);
```

**The problem:** Every time we render, we destroy and recreate everything. This loses:
- Input focus
- Typed text
- Scroll position
- Any element state

### Understanding Why This Matters

In a real app, we need to update the UI frequently:
- When user types
- When data changes
- When timers update
- When API calls complete

We can't destroy everything each time!

### The Solution: Diffing

Instead of replacing everything, we need to:
1. Compare old and new virtual DOM
2. Update only what changed

This is complex, so let's see why the current implementation exists in our framework.

### Examining the Real render.js

The actual `render.js` in our framework is much more sophisticated. It implements a "diffing" algorithm that:

1. Compares virtual DOM trees
2. Updates only changed elements
3. Preserves element state (focus, input values)
4. Reuses existing DOM nodes when possible

**Key insight:** This complexity exists to solve real problems we just discovered!

### Interactive Demo: See Diffing in Action

Create `test-diffing-demo.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Diffing Demo</title>
    <style>
        .highlight { background-color: yellow; transition: background-color 1s; }
    </style>
</head>
<body>
    <div id="app"></div>
    <button id="toggle">Toggle Naive vs Smart Rendering</button>
    
    <script type="module">
        import { h } from './framework/h.js';
        import { render } from './framework/render.js';
        
        let useNaiveRender = false;
        let counter = 0;
        let inputText = '';
        
        // Naive render (what we built)
        function naiveRender(vnode, container) {
            container.innerHTML = '';
            container.appendChild(createDomElement(vnode));
        }
        
        function createDomElement(vnode) {
            if (typeof vnode === 'string') {
                return document.createTextNode(vnode);
            }
            const element = document.createElement(vnode.tag);
            Object.entries(vnode.attrs || {}).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'value') {
                    element.value = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            vnode.children.forEach(child => {
                element.appendChild(createDomElement(child));
            });
            return element;
        }
        
        function updateApp() {
            const app = h('div', {}, [
                h('h1', {}, `Render Mode: ${useNaiveRender ? 'Naive' : 'Smart'}`),
                h('p', {}, `Counter: ${counter}`),
                h('input', { 
                    type: 'text', 
                    value: inputText,
                    placeholder: 'Type and watch focus...'
                }),
                h('p', {}, 'Instructions:'),
                h('ul', {}, [
                    h('li', {}, 'Click in the input and start typing'),
                    h('li', {}, 'Watch what happens to your cursor'),
                    h('li', {}, 'Toggle rendering modes to see the difference')
                ])
            ]);
            
            const renderFn = useNaiveRender ? naiveRender : render;
            renderFn(app, document.getElementById('app'));
            
            // Highlight what changed
            if (!useNaiveRender) {
                const counterElement = document.querySelector('p');
                counterElement.classList.add('highlight');
                setTimeout(() => counterElement.classList.remove('highlight'), 100);
            }
        }
        
        // Initial render
        updateApp();
        
        // Update counter every second
        setInterval(() => {
            counter++;
            updateApp();
        }, 1000);
        
        // Capture input changes (we'll make this work better with events later)
        setInterval(() => {
            const input = document.querySelector('input');
            if (input && document.activeElement === input) {
                inputText = input.value;
            }
        }, 50);
        
        // Toggle button
        document.getElementById('toggle').onclick = () => {
            useNaiveRender = !useNaiveRender;
            updateApp();
        };
    </script>
</body>
</html>
```

**What you'll observe:**
- Naive mode: Input loses focus every second
- Smart mode: Only the counter updates, input keeps focus
- The yellow highlight shows what actually changed

**Lesson learned:** The complex diffing algorithm in `render.js` solves real usability problems!

---

## Chapter 3: Event Handling Without addEventListener

### Starting Point: The Normal Way

Typically, we'd handle events like this:

```javascript
const button = document.createElement('button');
button.textContent = 'Click me';
button.addEventListener('click', () => {
    console.log('Button clicked!');
});
```

But with our virtual DOM, we want to declare events as part of our UI description:

```javascript
h('button', { onClick: () => console.log('Clicked!') }, 'Click me')
```

### The Challenge

Our render function creates new elements. If we used addEventListener:
1. We'd need to track every listener
2. Remove old listeners when elements update
3. Re-add new listeners
4. Memory leaks if we forget to remove listeners

### Event Delegation: A Clever Solution

Instead of adding listeners to each element, we'll use one listener on the document body!

Create `framework/events.js`:

```javascript
// events.js - Version 1: Basic event delegation
const eventHandlers = new Map();
let elementIdCounter = 0;

export function initEventSystem() {
    // Set up a single click handler for the whole document
    document.body.onclick = function(event) {
        handleDelegatedEvent('click', event);
    };
}

function handleDelegatedEvent(eventType, event) {
    // Start from the clicked element
    let target = event.target;
    
    // Walk up the DOM tree
    while (target && target !== document.body) {
        // Check if this element has handlers
        const elementId = target._eventId;
        if (elementId && eventHandlers.has(elementId)) {
            const handlers = eventHandlers.get(elementId);
            const handler = handlers[eventType];
            if (handler) {
                handler.call(target, event);
                break;
            }
        }
        // Move up to parent
        target = target.parentElement;
    }
}

export function updateEvents(element, newProps = {}) {
    // Extract onClick from props
    if (newProps.onClick) {
        // Assign unique ID to element
        if (!element._eventId) {
            element._eventId = ++elementIdCounter;
        }
        
        // Store the handler
        const handlers = eventHandlers.get(element._eventId) || {};
        handlers.click = newProps.onClick;
        eventHandlers.set(element._eventId, handlers);
    }
}
```

**New concepts:**
- `Map`: Like an object but better for storing key-value pairs
- Event bubbling: Events travel up the DOM tree
- `call()`: Executes function with specific `this` value

### Test Event Delegation

Create `test-events-v1.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Testing Events - Version 1</title>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { h } from './framework/h.js';
        import { initEventSystem, updateEvents } from './framework/events.js';
        
        // Initialize event system
        initEventSystem();
        
        // Simple render for testing
        function testRender(vnode, container) {
            container.innerHTML = '';
            const element = createTestElement(vnode);
            container.appendChild(element);
        }
        
        function createTestElement(vnode) {
            if (typeof vnode === 'string') {
                return document.createTextNode(vnode);
            }
            
            const element = document.createElement(vnode.tag);
            
            // Handle events
            updateEvents(element, vnode.attrs);
            
            // Handle other attributes
            Object.entries(vnode.attrs || {}).forEach(([key, value]) => {
                if (!key.startsWith('on')) {
                    element.setAttribute(key, value);
                }
            });
            
            vnode.children.forEach(child => {
                element.appendChild(createTestElement(child));
            });
            
            return element;
        }
        
        // Test app
        let clickCount = 0;
        
        function updateApp() {
            const app = h('div', {}, [
                h('h1', {}, 'Event Delegation Demo'),
                h('button', {
                    onClick: () => {
                        clickCount++;
                        console.log(`Button clicked! Count: ${clickCount}`);
                        updateApp();
                    }
                }, `Clicked ${clickCount} times`),
                h('p', {}, 'Open console to see logs')
            ]);
            
            testRender(app, document.getElementById('app'));
        }
        
        updateApp();
        
        // Show what's happening
        console.log('Event handlers stored:', eventHandlers);
        console.log('Notice: No addEventListener was called!');
    </script>
</body>
</html>
```

### Adding More Event Types

Let's extend our event system to handle more events:

```javascript
// events.js - Version 2: Multiple event types
export function initEventSystem() {
    const eventTypes = ['click', 'input', 'change', 'keydown'];
    
    eventTypes.forEach(eventType => {
        document.body['on' + eventType] = function(event) {
            handleDelegatedEvent(eventType, event);
        };
    });
}

export function updateEvents(element, newProps = {}, oldProps = {}) {
    const hasEvents = Object.keys(newProps).some(key => key.startsWith('on'));
    
    if (!element._eventId && hasEvents) {
        element._eventId = ++elementIdCounter;
    }
    
    if (!element._eventId) return;
    
    const handlers = eventHandlers.get(element._eventId) || {};
    
    // Update all event handlers
    Object.keys(newProps).forEach(key => {
        if (key.startsWith('on')) {
            const eventType = key.substring(2).toLowerCase();
            handlers[eventType] = newProps[key];
        }
    });
    
    if (Object.keys(handlers).length > 0) {
        eventHandlers.set(element._eventId, handlers);
    }
}
```

### Why This Approach?

Create a demo to show the benefits:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Event System Benefits</title>
</head>
<body>
    <div id="traditional"></div>
    <div id="delegated"></div>
    
    <script type="module">
        // Traditional approach
        const traditional = document.getElementById('traditional');
        traditional.innerHTML = '<h2>Traditional (addEventListener)</h2>';
        
        // Create 100 buttons with traditional event handling
        for (let i = 0; i < 100; i++) {
            const btn = document.createElement('button');
            btn.textContent = `Button ${i}`;
            btn.addEventListener('click', () => console.log(`Traditional ${i}`));
            traditional.appendChild(btn);
        }
        
        // Our approach
        import { initEventSystem } from './framework/events.js';
        initEventSystem();
        
        const delegated = document.getElementById('delegated');
        delegated.innerHTML = '<h2>Our Approach (Delegation)</h2>';
        
        // Create 100 buttons with delegated events
        for (let i = 0; i < 100; i++) {
            const btn = document.createElement('button');
            btn.textContent = `Button ${i}`;
            btn._eventId = i + 1000;
            
            // Store handler in our map (simplified)
            const map = new Map();
            map.set(btn._eventId, {
                click: () => console.log(`Delegated ${i}`)
            });
            
            // Imagine this is our global eventHandlers
            window.testHandlers = window.testHandlers || new Map();
            window.testHandlers.set(btn._eventId, {
                click: () => console.log(`Delegated ${i}`)
            });
            
            delegated.appendChild(btn);
        }
        
        console.log('Traditional: 100 event listeners attached');
        console.log('Our approach: Only 1 listener on document.body!');
    </script>
</body>
</html>
```

**Benefits of event delegation:**
1. Memory efficient - one listener instead of hundreds
2. Works with dynamic content
3. Automatic cleanup when elements are removed
4. Consistent event handling

---

## Chapter 4: State Management - Making Apps Reactive

### The Problem: Scattered Data

Without state management, our data lives everywhere:

```javascript
// Data scattered across variables
let userName = 'Guest';
let todos = [];
let clickCount = 0;

// Manual updates everywhere
function addTodo(text) {
    todos.push({ text, done: false });
    updateTodoListUI();  // Manual update
    updateTodoCountUI(); // Another manual update
    saveTodosToDB();     // Another update
}

function updateUserName(name) {
    userName = name;
    updateGreetingUI();   // Manual update
    updateProfileUI();    // Another manual update
}
```

**Problems:**
- Easy to forget an update
- Code duplication
- Hard to track what changed
- Difficult to debug

### Building a Simple State Store

Let's build state management step by step:

```javascript
// state.js - Version 1: Basic state store
let state = {
    userName: 'Guest',
    todos: [],
    clickCount: 0
};

export function getState() {
    return state;
}

export function setState(newState) {
    state = { ...state, ...newState };
    console.log('State updated:', state);
}
```

**New concept:**
- Spread operator `...`: Copies properties from one object to another

Test it:

```javascript
import { getState, setState } from './framework/state.js';

console.log('Initial state:', getState());
setState({ userName: 'Alice' });
setState({ clickCount: 5 });
console.log('Updated state:', getState());
```

### The Missing Piece: Automatic Updates

Our state updates, but the UI doesn't know about it! Let's add a notification system:

```javascript
// state.js - Version 2: With notifications
let state = {};
let listeners = [];

export function getState() {
    return state;
}

export function setState(newState) {
    // Update state
    state = { ...state, ...newState };
    
    // Notify all listeners
    listeners.forEach(listener => {
        listener(state);
    });
}

export function subscribe(listener) {
    listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

export function initState(initialState) {
    state = initialState;
}
```

**New concepts:**
- Observer pattern: Objects can "watch" for changes
- Callbacks: Functions passed to other functions
- Closure: The unsubscribe function "remembers" which listener to remove

### Making Our App Reactive

Create `test-state-reactive.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Reactive State Demo</title>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { h } from './framework/h.js';
        import { render } from './framework/render.js';
        import { initState, getState, setState, subscribe } from './framework/state.js';
        import { initEventSystem } from './framework/events.js';
        
        initEventSystem();
        
        // Initialize our app state
        initState({
            count: 0,
            userName: 'Guest',
            todos: []
        });
        
        // Define our app UI as a function of state
        function App() {
            const state = getState();
            
            return h('div', {}, [
                h('h1', {}, `Hello, ${state.userName}!`),
                h('input', {
                    type: 'text',
                    value: state.userName,
                    onInput: (e) => setState({ userName: e.target.value })
                }),
                h('hr', {}),
                h('h2', {}, `Count: ${state.count}`),
                h('button', {
                    onClick: () => setState({ count: state.count + 1 })
                }, 'Increment'),
                h('button', {
                    onClick: () => setState({ count: state.count - 1 })
                }, 'Decrement'),
                h('hr', {}),
                h('p', {}, `You have ${state.todos.length} todos`)
            ]);
        }
        
        // The magic: re-render when state changes!
        subscribe(() => {
            console.log('State changed, re-rendering...');
            render(App(), document.getElementById('app'));
        });
        
        // Initial render
        render(App(), document.getElementById('app'));
        
        // Test: Update state from console
        window.setState = setState;
        window.getState = getState;
        console.log('Try in console: setState({ count: 10 })');
    </script>
</body>
</html>
```

**What's happening:**
1. State changes trigger the subscriber
2. Subscriber re-renders the app
3. App function reads new state
4. UI updates automatically!

### Understanding Immutability

Here's a critical concept - why we create new objects:

```javascript
// DON'T do this - mutating state directly
const state = getState();
state.todos.push({ text: 'New todo' });
setState(state); // Same object reference - no update triggered!

// DO this - create new objects
setState({
    todos: [...getState().todos, { text: 'New todo' }]
}); // New array reference - update triggered!
```

Interactive demo to see why this matters:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Immutability Demo</title>
</head>
<body>
    <div id="app"></div>
    <button id="mutate">Add Todo (Wrong Way - Mutate)</button>
    <button id="immutable">Add Todo (Right Way - Immutable)</button>
    
    <script type="module">
        import { initState, getState, setState, subscribe } from './framework/state.js';
        
        initState({
            todos: ['Initial todo'],
            renderCount: 0
        });
        
        let updateCount = 0;
        
        subscribe((state) => {
            updateCount++;
            document.getElementById('app').innerHTML = `
                <h2>Render count: ${updateCount}</h2>
                <h3>Todos:</h3>
                <ul>
                    ${state.todos.map(todo => `<li>${todo}</li>`).join('')}
                </ul>
            `;
        });
        
        // Initial render
        setState({ renderCount: 1 });
        
        // Wrong way - mutate
        document.getElementById('mutate').onclick = () => {
            const state = getState();
            state.todos.push(`Mutated todo ${Date.now()}`);
            setState(state);
            console.log('Mutated state - did UI update?', state.todos);
        };
        
        // Right way - immutable
        document.getElementById('immutable').onclick = () => {
            setState({
                todos: [...getState().todos, `Immutable todo ${Date.now()}`]
            });
            console.log('Created new array - UI updated!');
        };
    </script>
</body>
</html>
```

**Try both buttons and observe:**
- Mutate button: State changes but UI doesn't update
- Immutable button: UI updates correctly

This is why immutability is crucial in state management!

---

## Chapter 5: Client-Side Routing

### Understanding Single-Page Apps

Traditional websites:
- Each link loads a new page
- Full page refresh
- Loses JavaScript state

Single-Page Apps (SPAs):
- JavaScript handles navigation
- No page refresh
- State persists

### Hash-Based Routing

We'll use the URL hash (the part after #) because:
1. Changes don't cause page reload
2. Browser handles back/forward buttons
3. Works without server configuration

Create `framework/router.js`:

```javascript
// router.js - Simple hash-based router
let currentRoute = '/';
let routeListeners = [];

function getRoute() {
    // Get hash without the # symbol, default to '/'
    return window.location.hash.slice(1) || '/';
}

export function initRouter() {
    currentRoute = getRoute();
    
    // Listen for hash changes
    window.onhashchange = () => {
        const newRoute = getRoute();
        if (newRoute !== currentRoute) {
            currentRoute = newRoute;
            notifyListeners();
        }
    };
    
    // Notify on initialization
    notifyListeners();
}

function notifyListeners() {
    routeListeners.forEach(listener => listener(currentRoute));
}

export function onRouteChange(listener) {
    routeListeners.push(listener);
    listener(currentRoute); // Call immediately with current route
    
    return () => {
        routeListeners = routeListeners.filter(l => l !== listener);
    };
}

export function navigate(path) {
    window.location.hash = path;
}
```

### Building a Multi-Page App

Create `test-routing.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Routing Demo</title>
    <style>
        nav { background: #eee; padding: 10px; }
        nav a { margin: 0 10px; }
        .active { font-weight: bold; }
    </style>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        import { h } from './framework/h.js';
        import { render } from './framework/render.js';
        import { initState, getState, setState, subscribe } from './framework/state.js';
        import { initRouter, onRouteChange, navigate } from './framework/router.js';
        import { initEventSystem } from './framework/events.js';
        
        // Initialize systems
        initEventSystem();
        initRouter();
        
        // Initialize state
        initState({
            currentPage: '/',
            userName: 'Guest',
            visitCount: { '/': 0, '/about': 0, '/contact': 0 }
        });
        
        // Page components
        function HomePage() {
            const state = getState();
            return h('div', {}, [
                h('h1', {}, 'Home Page'),
                h('p', {}, `Welcome, ${state.userName}!`),
                h('p', {}, `You've visited this page ${state.visitCount['/']} times`),
                h('input', {
                    type: 'text',
                    value: state.userName,
                    placeholder: 'Enter your name',
                    onInput: (e) => setState({ userName: e.target.value })
                })
            ]);
        }
        
        function AboutPage() {
            const state = getState();
            return h('div', {}, [
                h('h1', {}, 'About Page'),
                h('p', {}, 'This is a demo of client-side routing.'),
                h('p', {}, `You've visited this page ${state.visitCount['/about']} times`),
                h('p', {}, 'Notice how your name persists across pages!'),
                h('p', {}, `Your name: ${state.userName}`)
            ]);
        }
        
        function ContactPage() {
            const state = getState();
            return h('div', {}, [
                h('h1', {}, 'Contact Page'),
                h('p', {}, 'Contact us at: example@example.com'),
                h('p', {}, `You've visited this page ${state.visitCount['/contact']} times`)
            ]);
        }
        
        // Main App with navigation
        function App() {
            const state = getState();
            
            // Navigation component
            const nav = h('nav', {}, [
                h('a', {
                    href: '#/',
                    className: state.currentPage === '/' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/');
                    }
                }, 'Home'),
                h('a', {
                    href: '#/about',
                    className: state.currentPage === '/about' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/about');
                    }
                }, 'About'),
                h('a', {
                    href: '#/contact',
                    className: state.currentPage === '/contact' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/contact');
                    }
                }, 'Contact')
            ]);
            
            // Route to the right page
            let page;
            switch (state.currentPage) {
                case '/':
                    page = HomePage();
                    break;
                case '/about':
                    page = AboutPage();
                    break;
                case '/contact':
                    page = ContactPage();
                    break;
                default:
                    page = h('h1', {}, '404 - Page not found');
            }
            
            return h('div', {}, [nav, page]);
        }
        
        // Listen for route changes
        onRouteChange((route) => {
            console.log('Route changed to:', route);
            
            // Update visit count
            const visits = { ...getState().visitCount };
            visits[route] = (visits[route] || 0) + 1;
            
            setState({ 
                currentPage: route,
                visitCount: visits
            });
        });
        
        // Re-render on state changes
        subscribe(() => {
            render(App(), document.getElementById('app'));
        });
        
        // Initial render
        render(App(), document.getElementById('app'));
        
        // For testing in console
        window.navigate = navigate;
        console.log('Try: navigate("/about")');
    </script>
</body>
</html>
```

### Testing Router Features

1. **Click the links** - Pages change without reload
2. **Use browser back/forward** - Navigation works!
3. **Enter your name** - It persists across pages
4. **Check visit counts** - Each page tracks visits
5. **Look at the URL** - Hash changes with navigation

### Understanding the Benefits

Create a comparison demo:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SPA vs Traditional</title>
</head>
<body>
    <h1>Single-Page App Benefits</h1>
    
    <div style="display: flex; gap: 20px;">
        <div style="flex: 1; border: 1px solid #ccc; padding: 10px;">
            <h2>Traditional Website</h2>
            <p>Click these links (they really navigate):</p>
            <a href="page1.html">Page 1</a><br>
            <a href="page2.html">Page 2</a><br>
            <p>Problems:</p>
            <ul>
                <li>Full page reload</li>
                <li>Loses JavaScript state</li>
                <li>White flash between pages</li>
                <li>Slower navigation</li>
            </ul>
        </div>
        
        <div style="flex: 1; border: 1px solid #ccc; padding: 10px;">
            <h2>Our SPA Router</h2>
            <p>State: <span id="state">0</span></p>
            <button onclick="document.getElementById('state').textContent = parseInt(document.getElementById('state').textContent) + 1">
                Increment State
            </button>
            <p>Now navigate:</p>
            <a href="#/page1">Page 1</a><br>
            <a href="#/page2">Page 2</a><br>
            <p>Benefits:</p>
            <ul>
                <li>No page reload</li>
                <li>State preserved</li>
                <li>Smooth transitions</li>
                <li>Instant navigation</li>
            </ul>
        </div>
    </div>
</body>
</html>
```

---

## Chapter 6: Putting It All Together

Now let's see how all our framework features work together to create a complete application.

### The Complete Framework

Our framework now has:
1. **Virtual DOM** (`h.js`) - Describe UI as data
2. **Rendering** (`render.js`) - Efficiently update the DOM
3. **Events** (`events.js`) - Handle user interactions
4. **State** (`state.js`) - Manage application data
5. **Routing** (`router.js`) - Navigate between pages

### Building a Real App: Task Manager

Let's build a complete task management app using our framework:

Create `app-complete.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Task Manager - Built with Our Framework</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        nav {
            background: #333;
            color: white;
            padding: 10px;
            margin-bottom: 20px;
        }
        nav a {
            color: white;
            text-decoration: none;
            margin: 0 10px;
            padding: 5px 10px;
        }
        nav a.active {
            background: #555;
            border-radius: 3px;
        }
        .task-item {
            border: 1px solid #ddd;
            padding: 10px;
            margin: 5px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .completed {
            text-decoration: line-through;
            opacity: 0.6;
        }
        .priority-high { border-left: 5px solid red; }
        .priority-medium { border-left: 5px solid orange; }
        .priority-low { border-left: 5px solid green; }
        input, select, button {
            padding: 5px;
            margin: 5px;
        }
        .stats {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        // Import our complete framework
        import { h, render, initState, getState, setState, subscribe, initRouter, onRouteChange, navigate, initEventSystem } from './framework/index.js';
        
        // Initialize framework
        initEventSystem();
        initRouter();
        
        // Initialize application state
        initState({
            tasks: [
                { id: 1, text: 'Learn JavaScript', completed: true, priority: 'high' },
                { id: 2, text: 'Build a framework', completed: true, priority: 'high' },
                { id: 3, text: 'Create an app', completed: false, priority: 'medium' }
            ],
            newTaskText: '',
            newTaskPriority: 'medium',
            filter: 'all',
            currentPage: '/',
            user: {
                name: 'Developer',
                tasksCompletedToday: 0
            }
        });
        
        // Task Item Component
        function TaskItem({ task, onToggle, onDelete }) {
            return h('div', { 
                className: `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`
            }, [
                h('div', {}, [
                    h('input', {
                        type: 'checkbox',
                        checked: task.completed,
                        onChange: () => onToggle(task.id)
                    }),
                    h('span', {}, task.text),
                    h('small', {}, ` (${task.priority})`)
                ]),
                h('button', {
                    onClick: () => onDelete(task.id)
                }, 'Delete')
            ]);
        }
        
        // Pages
        function DashboardPage() {
            const state = getState();
            const totalTasks = state.tasks.length;
            const completedTasks = state.tasks.filter(t => t.completed).length;
            const highPriorityTasks = state.tasks.filter(t => t.priority === 'high' && !t.completed).length;
            
            return h('div', {}, [
                h('h1', {}, `Welcome, ${state.user.name}!`),
                h('div', { className: 'stats' }, [
                    h('h2', {}, 'Your Stats'),
                    h('p', {}, `Total Tasks: ${totalTasks}`),
                    h('p', {}, `Completed: ${completedTasks} (${totalTasks ? Math.round(completedTasks/totalTasks*100) : 0}%)`),
                    h('p', {}, `High Priority Pending: ${highPriorityTasks}`),
                    h('p', {}, `Tasks Completed Today: ${state.user.tasksCompletedToday}`)
                ]),
                h('button', {
                    onClick: () => navigate('/tasks')
                }, 'Go to Tasks')
            ]);
        }
        
        function TasksPage() {
            const state = getState();
            
            // Filter tasks
            const filteredTasks = state.tasks.filter(task => {
                if (state.filter === 'active') return !task.completed;
                if (state.filter === 'completed') return task.completed;
                return true;
            });
            
            // Task handlers
            const addTask = () => {
                if (state.newTaskText.trim()) {
                    setState({
                        tasks: [...state.tasks, {
                            id: Date.now(),
                            text: state.newTaskText.trim(),
                            completed: false,
                            priority: state.newTaskPriority
                        }],
                        newTaskText: ''
                    });
                }
            };
            
            const toggleTask = (id) => {
                const wasCompleted = state.tasks.find(t => t.id === id).completed;
                setState({
                    tasks: state.tasks.map(task =>
                        task.id === id ? { ...task, completed: !task.completed } : task
                    ),
                    user: {
                        ...state.user,
                        tasksCompletedToday: wasCompleted 
                            ? state.user.tasksCompletedToday - 1 
                            : state.user.tasksCompletedToday + 1
                    }
                });
            };
            
            const deleteTask = (id) => {
                setState({
                    tasks: state.tasks.filter(task => task.id !== id)
                });
            };
            
            return h('div', {}, [
                h('h1', {}, 'Tasks'),
                
                // Add new task
                h('div', {}, [
                    h('input', {
                        type: 'text',
                        placeholder: 'New task...',
                        value: state.newTaskText,
                        onInput: (e) => setState({ newTaskText: e.target.value }),
                        onKeyDown: (e) => {
                            if (e.key === 'Enter') addTask();
                        }
                    }),
                    h('select', {
                        value: state.newTaskPriority,
                        onChange: (e) => setState({ newTaskPriority: e.target.value })
                    }, [
                        h('option', { value: 'low' }, 'Low Priority'),
                        h('option', { value: 'medium' }, 'Medium Priority'),
                        h('option', { value: 'high' }, 'High Priority')
                    ]),
                    h('button', { onClick: addTask }, 'Add Task')
                ]),
                
                // Filter buttons
                h('div', {}, [
                    h('button', {
                        onClick: () => setState({ filter: 'all' }),
                        style: state.filter === 'all' ? 'font-weight: bold' : ''
                    }, 'All'),
                    h('button', {
                        onClick: () => setState({ filter: 'active' }),
                        style: state.filter === 'active' ? 'font-weight: bold' : ''
                    }, 'Active'),
                    h('button', {
                        onClick: () => setState({ filter: 'completed' }),
                        style: state.filter === 'completed' ? 'font-weight: bold' : ''
                    }, 'Completed')
                ]),
                
                // Task list
                h('div', {},
                    filteredTasks.length === 0
                        ? h('p', {}, 'No tasks to show!')
                        : filteredTasks.map(task =>
                            TaskItem({
                                task,
                                onToggle: toggleTask,
                                onDelete: deleteTask
                            })
                        )
                )
            ]);
        }
        
        function ProfilePage() {
            const state = getState();
            
            return h('div', {}, [
                h('h1', {}, 'Profile'),
                h('div', {}, [
                    h('label', {}, 'Your Name: '),
                    h('input', {
                        type: 'text',
                        value: state.user.name,
                        onInput: (e) => setState({
                            user: { ...state.user, name: e.target.value }
                        })
                    })
                ]),
                h('p', {}, 'Your progress is saved automatically!'),
                h('button', {
                    onClick: () => {
                        if (confirm('This will delete all tasks. Are you sure?')) {
                            setState({ tasks: [] });
                            navigate('/');
                        }
                    }
                }, 'Reset All Tasks')
            ]);
        }
        
        // Main App Component
        function App() {
            const state = getState();
            
            // Navigation
            const nav = h('nav', {}, [
                h('a', {
                    href: '#/',
                    className: state.currentPage === '/' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/');
                    }
                }, 'Dashboard'),
                h('a', {
                    href: '#/tasks',
                    className: state.currentPage === '/tasks' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/tasks');
                    }
                }, 'Tasks'),
                h('a', {
                    href: '#/profile',
                    className: state.currentPage === '/profile' ? 'active' : '',
                    onClick: (e) => {
                        e.preventDefault();
                        navigate('/profile');
                    }
                }, 'Profile')
            ]);
            
            // Route to correct page
            let page;
            switch (state.currentPage) {
                case '/':
                    page = DashboardPage();
                    break;
                case '/tasks':
                    page = TasksPage();
                    break;
                case '/profile':
                    page = ProfilePage();
                    break;
                default:
                    page = h('h1', {}, '404 - Page not found');
            }
            
            return h('div', {}, [nav, page]);
        }
        
        // Set up routing
        onRouteChange((route) => {
            setState({ currentPage: route });
        });
        
        // Set up rendering
        subscribe(() => {
            render(App(), document.getElementById('app'));
        });
        
        // Initial render
        render(App(), document.getElementById('app'));
        
        console.log('Task Manager loaded! Try these:');
        console.log('- Add and complete tasks');
        console.log('- Navigate between pages');
        console.log('- Change your name in Profile');
        console.log('- Filter tasks by status');
        console.log('- Notice how state persists across pages!');
    </script>
</body>
</html>
```

### What We've Accomplished

Our complete app demonstrates:

1. **Virtual DOM** - Efficient updates when tasks change
2. **Event System** - Handles all clicks and inputs without addEventListener
3. **State Management** - Single source of truth for all data
4. **Routing** - Multiple pages without page reloads
5. **Component Composition** - Reusable TaskItem component

### Framework vs Library

Remember our initial distinction?
- **Library**: You call it (like jQuery)
- **Framework**: It calls you

Our framework demonstrates this:
- You define components (framework calls them)
- You update state (framework handles rendering)
- You declare routes (framework manages navigation)

## Understanding the Architecture

Here's how data flows through our framework:

```
User Action (click, type, etc.)
    ↓
Event Handler (from our event system)
    ↓
setState() (update application state)
    ↓
Subscribers Notified
    ↓
App() function called (creates new virtual DOM)
    ↓
render() compares old and new virtual DOM
    ↓
Only changed DOM elements updated
    ↓
User sees the change
```

This one-way data flow makes our apps:
- Predictable
- Easy to debug
- Performant

## Conclusion

Congratulations! You've built a complete JavaScript framework from scratch. You now understand:

1. **Why** frameworks exist (solve real problems)
2. **How** they work internally
3. **Core concepts** used by React, Vue, and others
4. **JavaScript fundamentals** through practical application

### What You've Learned

**JavaScript Concepts:**
- Modules and imports/exports
- Functions and arrow functions
- Objects and arrays
- Event handling
- Closures and callbacks
- Spread operator and destructuring
- Map, filter, and other array methods

**Framework Concepts:**
- Virtual DOM and reconciliation
- Event delegation
- State management
- Client-side routing
- Component composition
- Reactive programming

### Next Steps

1. **Study the actual implementation** - The real `render.js` has optimizations we simplified
2. **Add features** - Lifecycle hooks, computed properties, middleware
3. **Build more apps** - Practice makes perfect
4. **Learn established frameworks** - You'll understand them much better now!

Remember: We built this framework to learn. For production apps, use battle-tested frameworks. But now you understand the magic behind them!

Happy coding! 🚀