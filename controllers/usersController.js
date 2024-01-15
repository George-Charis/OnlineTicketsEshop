const User = require('../model/User');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if(!users) return res.status(404).json({ 'message': 'No users found' });
    res.json(users);
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required.' });
    console.log(req.params.id);
    const user = await User.findOne({ uid: req.params.id }).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.id} not found` });
    }
    res.json(user)
}

const updateUser = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ 'message': 'User ID required. '});

    const user = await User.findOne({ uid: req.params.id}).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.id} not found` });
    }

    if(req.body.username) user.username = req.body.username;
    if(req.body.email){
        const foundEmail = await User.findOne({email: req.body.email}).exec();
        if(foundEmail) return res.sendStatus(409);
        user.email = req.body.email;
    }
    if(req.body.total_tickets) user.total_tickets = req.body.total_tickets;
    if(req.body.total_money_spend) user.total_money_spend = req.body.total_money_spend;

    const result = await user.save();
    res.json(result);
}

const deleteUser = async (req, res) => {
    if(!req?.params?.id) return res.status(400).json({ 'message': 'User ID required. '});

    const user = await User.findOne({ uid: req.params.id}).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.id} not found` });
    }

    const result = await User.deleteOne({ uid: user.uid });
    res.json(result);
}

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}