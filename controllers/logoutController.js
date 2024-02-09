const User = require('../model/User');

const handleLogout = async (req, res) => {

    //find the cookie where the refresh token is stored
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(404);
    const refreshToken = cookies.jwt;

    //find a user with same refresh token as the cookie
    const foundUser = await User.findOne({ refreshToken }).exec();
    //if no user found but cookie exists clear it 
    if(!foundUser){
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'});
        return res.sendStatus(204);
    } 

    //clear refresh token and cookie
    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None'});
    res.sendStatus(200);
}

module.exports = {handleLogout}