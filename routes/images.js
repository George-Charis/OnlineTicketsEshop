const express = require ('express');
const router = express.Router();
const imagesController = require('../controllers/imagesController');

router.route('/')
    .get(imagesController.getImagesByEvent)

router.route('/:eventName/:imageName')
    .get( 
         imagesController.getImagesByEvent)

module.exports = router;