const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const task = new Task({
            user: req.user._id,
            title,
            description,
            dueDate: dueDate || null
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, completed, dueDate } = req.body;

        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Check if user owns the task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, completed, dueDate },
            { new: true }
        );

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Check if user owns the task
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle completion status
router.patch("/:id/completion", auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Check ownership
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        task.completed = !task.completed; // toggle value
        await task.save();

        res.json(task);
    } catch (error) {
        console.error("PATCH /tasks/:id/completion error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;