const express = require('express');
const router = new express.Router();
const Task = require('../models/task');

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    //   res.render('tasks', { tasks, title: 'Tasks' });
    res.send({ tasks });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Submit task
router.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.redirect('/');
  } catch (e) {
    res.status(400).send();
  }
});

// Remove task
router.delete('/tasks/:tid', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.tid,
    });
    if (!task) return res.status(404).send();

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// Toggle complete state
router.patch('/tasks/:tid/togglecomplete', async (req, res) => {
  try {
    const task = await Task.findById(req.params.tid);
    task.completed = !task.completed;
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// Edit task
router.put('/tasks/:tid', async (req, res) => {
  try {
    const task = await Task.findById(req.params.tid);
    task.text = req.query.newText;
    task.dueDate = req.query.newDueDate;
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// Add tag
router.patch('/tasks/:tid/tags', async (req, res) => {
  try {
    const task = await Task.findById(req.params.tid);
    task.tags.push({ tag: req.body.tag });
    await task.save();
    res.send(task.tags.slice(-1)[0]._id);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// Remove tag
router.delete('/tasks/:tid/tags', async (req, res) => {
  try {
    const task = await Task.findById(req.params.tid);
    task.tags.pull({ _id: req.query.tagid });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
