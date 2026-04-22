const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory task store
let tasks = [
  { id: 1, title: 'Set up GitHub repository', done: true },
  { id: 2, title: 'Configure CI/CD pipeline', done: true },
  { id: 3, title: 'Deploy to Render', done: false },
];
let nextId = 4;

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, tasks });
});

// POST a new task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json({ success: true, task });
});

// PATCH toggle task done
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
  task.done = !task.done;
  res.json({ success: true, task });
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  tasks.splice(index, 1);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: process.env.APP_VERSION || '1.0.0' });
});

// Reset tasks (for testing)
app.post('/api/tasks/reset', (req, res) => {
  tasks = [];
  nextId = 1;
  res.json({ success: true });
});

module.exports = app;
