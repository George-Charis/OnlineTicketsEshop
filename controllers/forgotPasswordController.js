const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'multiplatformonlineticketshop@gmail.com', 
      pass: 'c5e9cafb0ef0d745667cf9d4776937ba75f52eb2505' 
    }
  });

const handleForgotPassword = async (req, res) => {

    const { reqUsername } = req.body;
    if(!reqUsername) return res.status(400).json({"message": "Username is required"});

    const foundUser = await User.findOne({username: reqUsername}).exec();
    if(!foundUser) return res.status(401).json({"message": `User: ${reqUsername} not found`});

    const resetToken = crypto.randomBytes(20).toString('hex');
    foundUser .resetToken = resetToken;

    

}

module.exports = { handleForgotPassword }