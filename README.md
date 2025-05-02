# Mini-Framework: Learn Modern Frontend Development from the Ground Up

This project is a lightweight JavaScript framework built for learning how modern frontend frameworks work under the hood. Instead of using a complex production framework, Mini-Framework provides the core building blocks in a clean, understandable codebase that you can learn from and extend.

## What I Learned

As a learner exploring web development, this project taught me:

- How virtual DOM implementations work
- The principles behind state management systems
- How routing works in single-page applications
- Event handling patterns in modern web apps
- How to build a complete application with minimal dependencies

## Framework Features

The framework consists of just four core modules, each responsible for a specific aspect of frontend development:

### 1. Virtual DOM (h.js)
```javascript
// Create DOM elements with a simple function
const element = h('div', { className: 'greeting' }, [
  h('h1', {}, 'Hello World'),
  h('p', {}, 'Welcome to Mini-Framework')
]);
```

### 2. Rendering Engine (render.js)
```javascript
// Render virtual DOM to the actual browser DOM
render(element, document.getElementById('app'));
```

### 3. State Management (state.js)
```javascript
// Initialize application state
initState({ count: 0 });

// Update state and trigger re-renders
setState({ count: getState().count + 1 });

// Subscribe to state changes
subscribe(renderApp);
```

### 4. Routing (router.js)
```javascript
// Initialize the router
initRouter();

// React to route changes
onRouteChange(route => {
  console.log(`Current route: ${route}`);
});

// Navigate programmatically
navigate('/about');
```

## The TodoMVC Implementation

To demonstrate how the framework can be used to build a real application, this project includes a complete implementation of TodoMVC - the standard benchmark for frontend frameworks.

### How TodoMVC Uses the Framework

The TodoMVC implementation showcases:

1. **Component Composition**: Breaking the UI into logical components
   ```javascript
   function TodoItem({ todo }) {
     return h('li', { className: todo.completed ? 'completed' : '' }, [
       // Component contents
     ]);
   }
   ```

2. **State Management**: Managing todos with the built-in state system
   ```javascript
   function handleAddTodo(event) {
     if (event.keyCode === ENTER_KEY) {
       setState(prevState => ({
         todos: [...prevState.todos, newTodo]
       }));
     }
   }
   ```

3. **Event Handling**: Responding to user interactions
   ```javascript
   h('input', {
     onkeydown: handleAddTodo,
     placeholder: 'What needs to be done?'
   })
   ```

4. **Routing**: Filtering todos based on the URL
   ```javascript
   // Handle route changes to filter todos
   onRouteChange(newRoute => {
     setState({ filter: newRoute });
   });
   ```

## Getting Started

1. Clone this repository
2. Open `todomvc/index.html` in your browser to see the TodoMVC implementation
3. Explore the code in the `framework/` directory to learn how it works
4. Try building your own small app using the framework!

## Why Learn This Way?

Understanding how frameworks work under the hood will make you a better developer, regardless of which framework you use professionally. This mini-framework strips away the complexity of production frameworks while maintaining the core architectural patterns that make them powerful.

By exploring a simple implementation, you can:
- Understand the "why" behind framework design decisions
- Learn transferable concepts that apply across frameworks
- Build a mental model of how modern web applications work
- Gain confidence to dive into more complex frameworks