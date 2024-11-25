import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const DATA_FILE = path.join(__dirname, '../data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Read todos from file
function readTodos() {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

// Write todos to file
function writeTodos(todos: any) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// Add todo
app.post('/todos', (req, res) => {
    const { username, todo } = req.body;
    const todos = readTodos();

    if (!todos[username]) {
        todos[username] = [];
    }

    todos[username].push(todo);
    writeTodos(todos);
    res.status(201).json({ message: 'Todo added successfully' });
});

// Get todos for user
app.get('/todos/:username', (req, res) => {
    const { username } = req.params;
    const todos = readTodos();
    res.json(todos[username] || []);
});

// Delete todo
app.delete('/todos', (req, res) => {
    const { username, todo } = req.body;
    const todos = readTodos();

    if (todos[username]) {
        todos[username] = todos[username].filter((t: string) => t !== todo);
        writeTodos(todos);
    }

    res.json({ message: 'Todo deleted successfully' });
});

// Delete user
app.delete('/todos/:username', (req, res) => {
    const { username } = req.params;
    const todos = readTodos();

    delete todos[username];
    writeTodos(todos);

    res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});