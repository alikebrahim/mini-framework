// Import framework functions
import {
    h,
    render,
    getState,
    setState,
    subscribe,
    initState,
    initRouter,
    onRouteChange,
    navigate
} from "../framework/index.js";

// --- Constants ---
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

// --- State Initialization ---
const initialState = {
    todos: [], // { id: number, title: string, completed: boolean, editing: boolean }
    filter: "/", // "/", "/active", "/completed"
    nextId: 1,
    editingId: null, // ID of the todo being edited
};
initState(initialState);

// --- Helper Functions ---
function getFilteredTodos() {
    const { todos, filter } = getState();
    if (filter === "/active") {
        return todos.filter(todo => !todo.completed);
    }
    if (filter === "/completed") {
        return todos.filter(todo => todo.completed);
    }
    return todos; // filter === "/"
}

function getActiveTodoCount() {
    return getState().todos.filter(todo => !todo.completed).length;
}

// --- Event Handlers ---
function handleAddTodo(event) {
    if (event.keyCode === ENTER_KEY) {
        const title = event.target.value.trim();
        if (title) {
            setState(prevState => ({
                todos: [
                    ...prevState.todos,
                    {
                        id: prevState.nextId,
                        title: title,
                        completed: false,
                        editing: false,
                    },
                ],
                nextId: prevState.nextId + 1,
            }));
            event.target.value = ""; // Clear input
        }
    }
}

function handleToggleTodo(id) {
    setState(prevState => ({
        todos: prevState.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
    }));
}

function handleDestroyTodo(id) {
    setState(prevState => ({
        todos: prevState.todos.filter(todo => todo.id !== id),
    }));
}

function handleToggleAll(event) {
    const completed = event.target.checked;
    setState(prevState => ({
        todos: prevState.todos.map(todo => ({ ...todo, completed })),
    }));
}

function handleClearCompleted() {
    setState(prevState => ({
        todos: prevState.todos.filter(todo => !todo.completed),
    }));
}

function handleStartEditing(id) {
    setState(prevState => ({
        todos: prevState.todos.map(todo =>
            todo.id === id ? { ...todo, editing: true } : { ...todo, editing: false } // Ensure only one is editing
        ),
        editingId: id,
    }));
    // Focus the input field after the state update and re-render
    // Use setTimeout to wait for the DOM update
    setTimeout(() => {
        const input = document.getElementById(`edit-${id}`);
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }, 0);
}

function handleEditKeyDown(event, id) {
    if (event.keyCode === ENTER_KEY) {
        handleSaveEdit(event, id);
    }
    if (event.keyCode === ESCAPE_KEY) {
        handleCancelEdit(id);
    }
}

function handleSaveEdit(event, id) {
    const title = event.target.value.trim();
    if (title) {
        setState(prevState => ({
            todos: prevState.todos.map(todo =>
                todo.id === id ? { ...todo, title: title, editing: false } : todo
            ),
            editingId: null,
        }));
    } else {
        // If title is empty, destroy the todo
        handleDestroyTodo(id);
    }
}

function handleCancelEdit(id) {
    setState(prevState => ({
        todos: prevState.todos.map(todo =>
            todo.id === id ? { ...todo, editing: false } : todo
        ),
        editingId: null,
    }));
}

// --- View Functions (using hyperscript) ---
function TodoItem({ todo }) {
    const { editingId } = getState();
    const isEditing = todo.id === editingId;

    return h("li", {
        className: `${todo.completed ? "completed" : ""} ${isEditing ? "editing" : ""}`,
        key: todo.id // Simple key for potential future diffing
    }, [
        h("div", { className: "view" }, [
            h("input", {
                className: "toggle",
                type: "checkbox",
                checked: todo.completed,
                onchange: () => handleToggleTodo(todo.id),
            }),
            h("label", { ondblclick: () => handleStartEditing(todo.id) }, todo.title),
            h("button", {
                className: "destroy",
                onclick: () => handleDestroyTodo(todo.id),
            }),
        ]),
        isEditing && h("input", {
            id: `edit-${todo.id}`, // ID for focusing
            className: "edit",
            value: todo.title,
            onblur: (e) => handleSaveEdit(e, todo.id), // Save on blur
            onkeydown: (e) => handleEditKeyDown(e, todo.id),
        })
    ]);
}

function AppView({ todos, filter, activeCount }) {
    const filteredTodos = getFilteredTodos();
    const allCompleted = todos.length > 0 && activeCount === 0;

    return h("div", {}, [
        h("header", { className: "header" }, [
            h("h1", {}, "todos"),
            h("input", {
                className: "new-todo",
                placeholder: "What needs to be done?",
                autofocus: true,
                onkeydown: handleAddTodo,
            }),
        ]),
        todos.length > 0 && h("section", { className: "main" }, [
            h("input", {
                id: "toggle-all",
                className: "toggle-all",
                type: "checkbox",
                checked: allCompleted,
                onchange: handleToggleAll,
            }),
            h("label", { htmlFor: "toggle-all" }, "Mark all as complete"),
            h("ul", { className: "todo-list" }, [
                filteredTodos.map(todo => h(TodoItem, { todo })) // Component usage
            ]),
        ]),
        todos.length > 0 && h("footer", { className: "footer" }, [
            h("span", { className: "todo-count" }, [
                h("strong", {}, activeCount),
                ` item${activeCount !== 1 ? "s" : ""} left`,
            ]),
            h("ul", { className: "filters" }, [
                h("li", {}, h("a", { href: "#/", className: filter === "/" ? "selected" : "" }, "All")),
                h("li", {}, h("a", { href: "#/active", className: filter === "/active" ? "selected" : "" }, "Active")),
                h("li", {}, h("a", { href: "#/completed", className: filter === "/completed" ? "selected" : "" }, "Completed")),
            ]),
            (todos.length - activeCount > 0) && h("button", {
                className: "clear-completed",
                onclick: handleClearCompleted,
            }, "Clear completed"),
        ]),
    ]);
}

// --- Main Render Logic ---
const rootElement = document.getElementById("root");

function renderApp() {
    const state = getState();
    const activeCount = getActiveTodoCount();
    const view = h(AppView, { todos: state.todos, filter: state.filter, activeCount });
    render(view, rootElement);
}

// --- Initialization ---
// Subscribe to state changes
subscribe(renderApp);

// Subscribe to route changes
onRouteChange(newRoute => {
    setState({ filter: newRoute });
    // No need to call renderApp here, state change subscription handles it
});

// Initialize router (this also triggers the first route change notification)
initRouter();

// Initial render
renderApp();

