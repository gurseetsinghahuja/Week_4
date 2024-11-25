import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

export type TUser = {
    name: string;
    todos: string[];
}

const app = express();

app.use(express.json());
app.use(express.static('public'));

// File operations
const DATA_FILE = 'data.json';

async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
}

async function readData(): Promise<TUser[]> {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeData(data: TUser[]) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize data file
initializeDataFile();

// Routes
app.post('/add', async (req, res) => {
    try {
        const { name, todo } = req.body;
        const users = await readData();

        const existingUser = users.find(user => user.name === name);
        if (existingUser) {
            existingUser.todos.push(todo);
        } else {
            users.push({ name, todos: [todo] });
        }

        await writeData(users);
        res.json({ message: `Todo added successfully for user ${name}.` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/todos/:id', async (req, res) => {
    try {
        const users = await readData();
        const user = users.find(u => u.name.toLowerCase() === req.params.id.toLowerCase());

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/delete', async (req, res) => {
    try {
        const { name } = req.body;
        let users = await readData();
        users = users.filter(user => user.name !== name);
        await writeData(users);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/update', async (req, res) => {
    try {
        const { name, todo } = req.body;
        const users = await readData();
        const user = users.find(u => u.name === name);
        if (user) {
            user.todos = user.todos.filter(t => t !== todo);
            await writeData(users);
            res.json({ message: 'Todo deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default app;