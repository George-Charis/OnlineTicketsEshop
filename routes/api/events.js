const express = require('express');
const router = express.Router();
const eventsController = require('../../controllers/eventsController');
const multer = require('multer');
const form = multer();

router.route('/')
    .get(eventsController.getAllEvents)
    .put(eventsController.updateEvent)
    .post(form.array("files"), eventsController.addEvent)
    .delete(eventsController.deleteEvent);

router.route('/:name')
    .get(eventsController.getEvent)
    .put(eventsController.updateEvent)
    .delete(eventsController.deleteEvent);

module.exports = router;