const express = require('express');
const router = new express.Router();
const TaskList = require('../models/taskList');

// Get all task lists
router.get('/tasklist', async (req, res) => {
  const tasklist = await TaskList.find({});

  try {
    //   res.render('tasks', { tasks, title: 'Tasks' });
    res.send({ taskslist });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Submit task list
router.post('/tasklist', async (req, res) => {
  try {
    const tasklist = new TaskList(req.body);
    await tasklist.save();
    res.redirect('/');
  } catch (e) {
    res.status(400).send();
  }
});

// Remove task list
router.delete('/tasklist/:tid', async (req, res) => {
  try {
    const tasklist = await TaskList.findOneAndDelete({
      _id: req.params.tid,
    });
    if (!tasklist) return res.status(404).send();

    // TODO remove tasks of this list

    res.send(tasklist);
  } catch (e) {
    res.status(500).send();
  }
});

// Edit task list
router.put('/tasklist/:tid', async (req, res) => {
  try {
    const tasklist = await TaskList.findById(req.params.tid);
    tasklist.text = req.query.newText;
    tasklist.dueDate = req.query.newDueDate;
    tasklist.reminder = req.query.newReminder;
    await tasklist.save();
    res.send(tasklist);
  } catch (e) {
    res.status(500).send();
  }
});

// Add tag
router.patch('/tasklist/:tlid/tags', async (req, res) => {
  try {
    const tasklist = await TaskList.findById(req.params.tlid);
    tasklist.tags.push({ tag: req.body.tag });
    await tasklist.save();
    res.send(tasklist.tags.slice(-1)[0]._id);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// Remove tag
router.delete('/tasklist/:tlid/tags', async (req, res) => {
  try {
    const tasklist = await TaskList.findById(req.params.tlid);
    tasklist.tags.pull({ _id: req.query.tagid });
    await tasklist.save();
    res.send(tasklist);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
