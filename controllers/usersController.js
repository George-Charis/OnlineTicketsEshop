const User = require('../model/User');
const bcrypt = require("bcrypt");
const crypto = require('crypto');

const getAllUsers = async (req, res) => {
    const users = await User.find();
    if(!users) return res.status(404).json({ 'message': 'No users found' });
    res.json(users);
}

const getUser = async (req, res) => {
    if (!req?.params?.key || !req?.params?.iv) return res.status(400).json({ 'message': 'encrypted User ID and iv are required.' });

    //decrypt the encryptedUid-iv
    const secretKey = process.env.UID_SECRET_KEY; 
    const decryptUid = (encryptedData, secretKey) => {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
        let decryptedUid = decipher.update(encryptedData.encryptedUid, 'hex', 'utf-8');
        decryptedUid += decipher.final('utf-8');
        return decryptedUid;
    };

    const encryptedData = {
        "encryptedUid": req.params.key,
        "iv": req.params.iv
    };

    const decryptedUid = decryptUid(encryptedData,secretKey); 

    //check if user exists
    const user = await User.findOne({ uid: decryptedUid }).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.key} not found` });
    }
    res.status(200).json(user);
}

const updateUser = async (req, res) => {
    //optional encryptedUid/iv - works with userId as well as 
    if (!req?.params?.key) return res.status(400).json({ 'message': 'encrypted User ID and iv are required.' });

    //store the encrypted uid or uid- depends if user knows the actual uid for example admins
    let decryptedUid = req.params.key;

    //if iv is provided means that uid is encrypted
    if(req.params.iv){
        //decrypt
        const secretKey = process.env.UID_SECRET_KEY; 
        const decryptUid = (encryptedData, secretKey) => {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
            let decryptedUid = decipher.update(encryptedData.encryptedUid, 'hex', 'utf-8');
            decryptedUid += decipher.final('utf-8');
            return decryptedUid;
        };

        const encryptedData = {
            "encryptedUid": req.params.key,
            "iv": req.params.iv
        };

        decryptedUid = decryptUid(encryptedData,secretKey);
    }

    const user = await User.findOne({ uid: decryptedUid}).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.key} not found` });
    }

    if(req.body.username) user.username = req.body.username;
    if(req.body.email){
        //check for email duplication
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
    //optional encryptedUid/iv - works with userId as well as
    if (!req?.params?.key) return res.status(400).json({ 'message': 'encrypted User ID and iv are required.' });

    //store the encrypted uid or uid- depends if user knows the actual uid for example admins
    let decryptedUid = req.params.key;

     //if iv is provided means that uid is encrypted
    if(req.params.iv){
        //decrypt
        const secretKey = process.env.UID_SECRET_KEY; 
        const decryptUid = (encryptedData, secretKey) => {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(encryptedData.iv, 'hex'));
            let decryptedUid = decipher.update(encryptedData.encryptedUid, 'hex', 'utf-8');
            decryptedUid += decipher.final('utf-8');
            return decryptedUid;
        };

        const encryptedData = {
            "encryptedUid": req.params.key,
            "iv": req.params.iv
        };

        decryptedUid = decryptUid(encryptedData,secretKey);
    }
    
    const user = await User.findOne({ uid: decryptedUid}).exec();
    if (!user) {
        return res.status(404).json({ 'message': `User ID ${req.params.key} not found` });
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