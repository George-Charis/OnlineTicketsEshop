const jwt = require('jsonwebtoken');
const User = require('../model/User');

const verifyResetToken = (req, res, next) => {
    const { resetToken } = req.params;

      jwt.verify(
          resetToken,
          process.env.RESET_TOKEN_SECRET,
          async (err, decoded) => {
            if( err ) return res.status(403).json({ 'message': 'Your session has expired' });
            const foundUser = await User.findOne({resetToken: resetToken}).exec();
            if( !foundUser ) return res.status(403).json({ 'message': 'Your session has expired' });
            next();
          }
      )
  }

module.exports = verifyResetToken