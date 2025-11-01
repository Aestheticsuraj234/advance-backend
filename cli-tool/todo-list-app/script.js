document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');

    // Array to store todo items
    // Each todo item will be an object: { id: string, text: string, completed: boolean }
    let todos = [];

    /**
     * Generates a unique ID for a new todo item.
     * @returns {string} A unique ID.
     */
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Saves the current todos array to localStorage.
     */
    function saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (e) {
            console.error("Error saving todos to localStorage:", e);
            alert("Failed to save todos. Your browser might be in private mode or storage is full.");
        }
    }

    /**
     * Loads todos from localStorage and renders them.
     */
    function loadTodos() {
        try {
            const storedTodos = localStorage.getItem('todos');
            if (storedTodos) {
                todos = JSON.parse(storedTodos);
            }
        } catch (e) {
            console.error("Error loading todos from localStorage:", e);
            alert("Failed to load todos. Data might be corrupted or storage is inaccessible.");
            todos = []; // Reset todos if loading fails
        }
        renderTodos();
    }

    /**
     * Creates an HTML element for a single todo item.
     * @param {object} todo - The todo object { id, text, completed }.
     * @returns {HTMLLIElement} The list item element.
     */
    function createTodoElement(todo) {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        if (todo.completed) {
            listItem.classList.add('completed');
        }
        listItem.dataset.id = todo.id; // Store ID on the element for easy access

        listItem.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span>${todo.text}</span>
            </div>
            <button class="delete-btn" data-id="${todo.id}">Delete</button>
        `;

        return listItem;
    }

    /**
     * Renders all todos from the `todos` array to the DOM.
     * Clears existing list items before rendering.
     */
    function renderTodos() {
        todoList.innerHTML = ''; // Clear current list
        if (todos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = "No todos yet! Add one above.";
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            emptyMessage.style.padding = '15px';
            todoList.appendChild(emptyMessage);
            return;
        }
        todos.forEach(todo => {
            todoList.appendChild(createTodoElement(todo));
        });
    }

    /**
     * Adds a new todo item based on the input field value.
     */
    function addTodo() {
        const todoText = todoInput.value.trim();

        if (todoText === '') {
            alert('Todo cannot be empty!');
            return;
        }

        const newTodo = {
            id: generateUniqueId(),
            text: todoText,
            completed: false
        };

        todos.push(newTodo);
        saveTodos();
        renderTodos();
        todoInput.value = ''; // Clear input field
        todoInput.focus(); // Keep focus on input for quick entry
    }

    /**
     * Toggles the 'completed' status of a todo item.
     * @param {string} id - The ID of the todo item to toggle.
     */
    function toggleComplete(id) {
        todos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        renderTodos();
    }

    /**
     * Deletes a todo item from the list.
     * @param {string} id - The ID of the todo item to delete.
     */
    function deleteTodo(id) {
        // Optional: Add a confirmation dialog for deletion
        if (!confirm("Are you sure you want to delete this todo?")) {
            return;
        }
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }

    // --- Event Listeners ---

    // Add todo button click
    addTodoBtn.addEventListener('click', addTodo);

    // Add todo on Enter key press in the input field
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Event delegation for todo list items (checkbox and delete button)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const todoId = target.dataset.id;

        if (!todoId) return; // Not a relevant element

        if (target.classList.contains('todo-checkbox')) {
            toggleComplete(todoId);
        } else if (target.classList.contains('delete-btn')) {
            deleteTodo(todoId);
        }
    });

    // Initial load of todos when the page loads
    loadTodos();
});