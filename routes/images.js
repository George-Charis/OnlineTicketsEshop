const express = require ('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const imagesController = require('../controllers/imagesController');
const filesPayloadExists = require('../middleware/filesPayloadExists');
const fileExtLimiter = require('../middleware/fileExtLimiter');
const fileSizeLimiter = require('../middleware/fileSizeLimiter');

router.route('/')
    .get(imagesController.getImagesByEvent)

router.route('/:eventName')
    .get(fileUpload({ createParentPath: true }),
         filesPayloadExists, 
         fileExtLimiter, 
         fileSizeLimiter, 
         imagesController.getImagesByEvent)

module.exports = router;