let currentUser = '';

async function addTodo() {
    const username = document.getElementById('username').value;
    const todo = document.getElementById('todo').value;

    if (!username || !todo) {
        showMessage('Please fill in both username and todo', true);
        return;
    }

    try {
        const response = await fetch('/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, todo })
        });

        const result = await response.json();
        if (response.ok) {
            showMessage(result.message);
            document.getElementById('todo').value = '';
            if (currentUser === username) {
                searchUser();
            }
        } else {
            showMessage(result.message || 'Failed to add todo', true);
        }
    } catch (error) {
        showMessage('Error adding todo', true);
    }
}

async function searchUser() {
    const username = document.getElementById('searchUsername').value;
    if (!username) {
        showMessage('Please enter a username to search', true);
        return;
    }

    try {
        const response = await fetch(`/todos/${username}`);
        const todos = await response.json();

        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';

        if (todos.length > 0) {
            currentUser = username;
            document.getElementById('deleteUser').style.display = 'block';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo;
                li.onclick = () => deleteTodo(username, todo);
                todoList.appendChild(li);
            });
        } else {
            showMessage('No todos found for this user', true);
            document.getElementById('deleteUser').style.display = 'none';
        }
    } catch (error) {
        showMessage('Error searching for user', true);
    }
}

async function deleteTodo(username, todo) {
    try {
        const response = await fetch('/todos', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, todo })
        });

        const result = await response.json();
        if (response.ok) {
            showMessage(result.message);
            searchUser();
        } else {
            showMessage(result.message || 'Failed to delete todo', true);
        }
    } catch (error) {
        showMessage('Error deleting todo', true);
    }
}

async function deleteUser() {
    if (!currentUser) return;

    try {
        const response = await fetch(`/todos/${currentUser}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            showMessage(result.message);
            document.getElementById('todoList').innerHTML = '';
            document.getElementById('deleteUser').style.display = 'none';
            currentUser = '';
        } else {
            showMessage(result.message || 'Failed to delete user', true);
        }
    } catch (error) {
        showMessage('Error deleting user', true);
    }
}

function showMessage(message, isError = false) {
    const messageArea = document.getElementById('message');
    messageArea.textContent = message;
    messageArea.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        messageArea.textContent = '';
    }, 3000);
}