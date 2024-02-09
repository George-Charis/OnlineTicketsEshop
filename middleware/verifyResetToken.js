const jwt = require('jsonwebtoken');
const User = require('../model/User');

//middleware to check if reset token (is generated in forgot password) is expired
const verifyResetToken = (req, res, next) => {
    const { resetToken } = req.params;

      jwt.verify(
          resetToken,
          process.env.RESET_TOKEN_SECRET,
          async (err, decoded) => {
            if( err ) return res.status(403).json({ 'message': 'Your session has expired' });
            const foundUser = await User.findOne({resetToken: resetToken}).exec();
            //if user has changed his password access to link forbidden
            if( !foundUser ) return res.status(403).json({ 'message': 'Your session has expired' });
            next();
          }
      )
  }

module.exports = verifyResetToken