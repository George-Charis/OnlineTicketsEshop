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

    //find the event date and remove the quantity 
    const selectedDate = foundEvent.event_dates.find(dateObj => {
        if(dateObj.date.toISOString().slice(0,10) === date_of_event.slice(0,10)){
                dateObj.max_tickets -= quantity;
                return dateObj;         
        }           
    });

    console.log(selectedDate);


    if (!selectedDate) 
        return res.status(404).json({ 'message': 'Date not found in event_dates' });

        //check the amount of available tickets
    if(selectedDate.max_tickets<0)
        return res.status(401).json({'message': `There are ${selectedDate.max_tickets + quantity} available`});


   try{
        const totalPrice = quantity * foundEvent.event_ticket_price;

        //make the order
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

        //add the amount of tickets and the total price to user
        foundUser.total_tickets += quantity;
        foundUser.total_money_spend += totalPrice;
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

    const foundOrder = await Order.findOne({orderId: req.params.id}).exec();
    if(!foundOrder) return res.status(404).json({'message': 'No order found'});

    const foundEvent = await Event.findOne({event_name: foundOrder.event}).exec();
    if(!foundEvent) return res.status(404).json({'message': 'No event found'});
    
    //find the date of event to add the canceled quantity
    foundEvent.event_dates.find(dateObj => {
        console.log(dateObj.date.toISOString().slice(0,10))
        console.log(foundOrder.date_of_event.toISOString().slice(0,10))
        if(dateObj.date.toISOString().slice(0,10) === foundOrder.date_of_event.toISOString().slice(0,10)){
            dateObj.max_tickets += foundOrder.quantity;
        }           
    });


    const foundUser = await User.findOne({email: foundOrder.user_email}).exec();
    if(!foundUser) return res.status(404).json({'message': 'No user found'});

    //remove the quantity and the money from the user
    foundUser.total_tickets -= foundOrder.quantity;
    foundUser.total_money_spend -= foundOrder.total_price;

    await foundUser.save();
    await foundEvent.save();

    //delete order
    await Order.deleteOne({orderId: foundOrder.orderId});
    return res.json(foundOrder);
}

module.exports = { 
    makeNewOrder,
    getAllOrders,
    getOrder,
    deleteOrder  
}