const Events = require('../model/Event');
const imagesController = require("./imagesController");

const getAllEvents = async (req, res) => {
    const events = await Events.find();
     if(!events) return res.status(404).json({ 'message': 'No events found' });
     res.json(events);
}

const getEvent = async (req, res) => {
    if(!req?.params?.name) return res.status(400).json({ 'message': 'Event\'s name required.' });

    const event = await Events.findOne({event_name : req.params.name}).exec();
    if(!event) return res.status(404).json({ 'message': `Event's name ${req.params.name} not found` });
    res.json(event);
}

const addEvent = async (req, res) => {
    const { eventName, description, category, dates, coordinates, ticketPrice } = req.body;
    const files = req.files;

    if (!eventName || !description || !dates || !coordinates || !ticketPrice || !category) {
        return res.status(400).json({ 'message': 'Event\'s name, description, date, coordinates, ticket_price and category are required' });
    }

    const foundEvent = await Events.findOne({ event_name: eventName }).exec();
    if (foundEvent) return res.sendStatus(409);

    let imageUrls = [];

    if(files){
        imageUrls = await imagesController.storeImages(files, eventName);
        console.log(imageUrls);
    }

    try {

        await Events.create({
            "event_name": eventName,
            "event_description": description,
            "event_category": category,
            "event_dates": dates,
            "event_coordinates": coordinates,
            "event_ticket_price": ticketPrice,
            "event_images": imageUrls
        });

        res.status(201).json({ 'success': `New event ${eventName} created!` });
    } catch (err) {
        console.error('Error in addEvent:', err);
        res.status(500).json({ "message": 'Internal Server Error' });
    }
}


const updateEvent = async (req, res) => {
    if(!req?.params?.name) return res.status(400).json({ 'message': `Event's name required.` });
    const files = req.files;

    const event = await Events.findOne({ event_name: req.params.name }).exec();
    if(!event) return res.status(404).json({ 'message': `Event name ${req.params.name} not found` });

    let imageUrls = [];

    if(files){
        imageUrls = await imagesController.storeImages(files, event.event_name);
        console.log(imageUrls);
        event.event_images.push(...imageUrls);
    }

    if(req.body.eventName){
        const foundName = await Events.findOne({event_name : req.body.eventName}).exec();
        if(foundName) return res.sendStatus(409);
        event.event_name = req.body.eventName;  
    } 
    if(req.body.description) event.event_description = req.body.description;
    if(req.body.date) event.event_dates = req.body.date;
    if(req.body.coordinates) event.event_coordinates = req.body.coordinates;
    if(req.body.ticket_price) event.event_ticket_price = req.body.ticket_price;

    const result = await event.save();
    res.json(result);
}

const deleteEvent = async (req, res) => {
    if(!req?.params?.name) return res.status(400).json({ 'message': 'Event\'s name required.' });

    const event = await Events.findOne({ event_name: req.params.name }).exec();
    if(!event) return res.status(404).json({ 'message': `Event name ${req.params.name} not found` });

    const result = await event.deleteOne({event_name: event.event_name});
    res.json(result);
}

module.exports = {
    getAllEvents,
    getEvent,
    addEvent,
    updateEvent,
    deleteEvent
}