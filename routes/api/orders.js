const express = require('express');
const router = express.Router();
const orderController = require("../../controllers/orderController");

router.route('/')
    .get(orderController.getAllOrders)
    .post(orderController.makeNewOrder);

router.route('/:id')
    .get(orderController.getOrder)
    .delete(orderController.deleteOrder)

module.exports = router;