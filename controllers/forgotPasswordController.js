const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

const handleForgotPassword = async (req, res) => {

    const { reqUserEmail } = req.body;
    if(!reqUserEmail) return res.status(400).json({"message": "User's email is required"});

    const foundUser = await User.findOne({email: reqUserEmail}).exec();
    if(!foundUser) return res.status(401).json({"message": `User's email: ${reqUserEmail} not found`});

    const resetToken = jwt.sign(
      { "UserInfo": {
        email: foundUser.email,
        "resetTokenCode" : crypto.randomBytes(20).toString('hex')
      }},
      process.env.RESET_TOKEN_SECRET,
      {expiresIn: '10m'}
    );

    foundUser.resetToken = resetToken;
    await foundUser.save();

    const confirmationLink = `http://localhost:3500/forgotPassword/${resetToken}`;
    const mailOptions = {
      from: 'multiplatformonlineticketshop@gmail.com',
      to: foundUser.email,
      subject: 'Change password',
      html: `
        <p>Click the link below to verify that you want to change your password:</p><br><p>The link will be available for 10 minutes</p>
        <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #0024a8; color: white; text-decoration: none;">Change password</a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({'message': `An email has been sent to ${foundUser.email}`});
}

const changePassword = async (req, res) => {
  
  if(!req?.params?.resetToken) return res.status(400).json({'message': "Reset token is required"});
  const resetToken = req.params.resetToken;

  const {newPassword, confirmNewPassword} = req.body;

  if(!newPassword || !confirmNewPassword) return res.status(400).json({'message': "Both fields must be completed"});

  if(newPassword !== confirmNewPassword) return res.status(400).json({'message': "The passwords are not the same"});

  const foundUser = await User.findOne({resetToken: resetToken});
  if(!foundUser) return res.status(404).json({'message': "User not found"});

  const oldPasswordDecoded = await bcrypt.compare(newPassword, foundUser.password);
  if(oldPasswordDecoded) return res.status(400).json({'message': 'Please type a new password and not the one that you already have'});
  
  foundUser.password = await bcrypt.hash(newPassword, 10);
  foundUser.resetToken = " ";
  await foundUser.save();

  res.sendStatus(200);
}

module.exports = { handleForgotPassword, changePassword }