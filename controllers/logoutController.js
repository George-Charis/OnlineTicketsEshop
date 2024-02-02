const User = require('../model/User');

const handleLogout = async (req, res) => {

    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(404);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if(!foundUser){
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'});
        return res.sendStatus(204);
    } 

    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'});
    res.sendStatus(200);
}

module.exports = {handleLogout}