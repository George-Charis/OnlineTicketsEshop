const Order = require('../model/Order');
const Event = require('../model/Event');
const User = require('../model/User');
const {v4: uuid} = require('uuid');

const makeNewOrder = async (req, res) => {
    const { event, quantity, date_of_event , user_email } = req.body;

    if(!event || !quantity || !date_of_event || !user_email) return res.status(400).json({'message': `Event's name, quantity of tickets, date of booking and user's email are required`});

    const foundUser = await User.findOne({email: user_email}).exec();
    if(!foundUser) return res.status(404).json({'message': 'User not found'});

    const foundEvent = await Event.findOne({event_name: event}).exec();
    if(!foundEvent) return res.status(404).json({'message': 'Event not found'});

    const selectedDate = foundEvent.event_dates.find(dateObj => {
        if(dateObj.date.toISOString().slice(0, 10) === date_of_event){
            dateObj.max_tickets -= quantity;
            return dateObj;
        }           
    });


    if (!selectedDate) 
        return res.status(404).json({ 'message': 'Date not found in event_dates' });
    

    if(selectedDate.max_tickets-quantity<=0) 
        return res.status(400).json({'message': `There are ${selectedDate.max_tickets} available`});

   try{
        const totalPrice = quantity * foundEvent.event_ticket_price;

        const result = await Order.create({
            "orderId": uuid(),
            "event": event,
            "quantity": quantity,
            "total_price": totalPrice,
            "date_of_event": selectedDate.date,
            "user_email": user_email
        });

        console.log(result);

        const updatedEvent = await foundEvent.save();

        console.log(updatedEvent);

        foundUser.total_tickets = quantity;
        foundUser.total_money_spend = totalPrice;
        const updatedUser = await foundUser.save();

        console.log(updatedUser);

        return res.status(200).json(result.orderId);
   }catch(err){
        console.log(err.message);
   }
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find();
    if(!orders.length) return res.status(404).json({'message': 'No order found'});
    return res.json(orders);
}

const getOrder = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({'message': 'Order id required'});

    const foundOrder = await Order.findOne({orderId: req.params.id});
    if(!foundOrder) return res.status(404).json({'message': 'No order found'});

    return res.json(foundOrder);
}

const deleteOrder = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({'message': 'Order id required'});

    const foundOrder = await Order.findOne({orderId: req.params.id});
    if(!foundOrder) return res.status(404).json({'message': 'No order found'});

    const deletedOrder = await Order.deleteOne({orderId: foundOrder.orderId});
    return res.json(foundOrder);
}

module.exports = { 
    makeNewOrder,
    getAllOrders,
    getOrder,
    deleteOrder  
}