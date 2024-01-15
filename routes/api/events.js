const express = require('express');
const router = express.Router();
const eventsController = require('../../controllers/eventsController');

router.route('/')
    .get(eventsController.getAllEvents)
    .put(eventsController.updateEvent)
    .post(eventsController.addEvent)
    .delete(eventsController.deleteEvent);

router.route('/:name')
    .get(eventsController.getEvent)
    .put(eventsController.updateEvent)
    .delete(eventsController.deleteEvent);

module.exports = router;