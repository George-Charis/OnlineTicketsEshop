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
    console.log(req.body);
    const { name, description, date, coordinates, ticket_price, images } = req.body;
    const files = req.files;

    if (!name || !description || !date || !coordinates || !ticket_price) {
        return res.status(400).json({ 'message': 'Event\'s name, description, date, coordinates and ticket_price' });
    }

    const foundEvent = await Events.findOne({ event_name: name }).exec();
    if (foundEvent) return res.sendStatus(409);

    if(files){
        const imagesArray = await imagesController.storeImages(files, name);
        console.log(imagesArray);
    }

    try {
        await Events.create({
            "event_name": name,
            "event_description": description,
            "event_date": date,
            "event_coordinates": coordinates,
            "event_ticket_price": ticket_price,
           // "event_images": imagesArray
        });

        res.status(201).json({ 'success': `New event ${name} created!` });
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
}



const updateEvent = async (req, res) => {
    if(!req?.params?.name) return res.status(400).json({ 'message': `Event's name required.` });

    const event = await Events.findOne({ event_name: req.params.name }).exec();
    if(!event) return res.status(404).json({ 'message': `Event name ${req.params.name} not found` });

    if(req.body.eventName){
        const foundName = await Events.findOne({event_name : req.body.eventName}).exec();
        if(foundName) return res.sendStatus(409);
        event.event_name = req.body.eventName;  
    } 
    if(req.body.description) event.event_description = req.body.description;
    if(req.body.date) event.event_date = req.body.date;
    if(req.body.coordinates) event.event_coordinates = req.body.coordinates;
    if(req.body.ticket_price) event.event_ticket_price = req.body.ticket_price;

    const result = await event.save();
    res.json(event);
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




