const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req,res) => {

    //check if username/email and password are completed
    const {usernameOrEmail, pwd} = req.body;
    if(!usernameOrEmail || !pwd) return res.status(400).json({ 'message': 'Username/email and password are required.'});

    //check if the value of usernameOrEmail matches a username or email from the db
    const foundUser = await User.findOne({
        $or: [
            {username: usernameOrEmail},
            {email: usernameOrEmail}
        ]}).exec();

    if(!foundUser) return res.sendStatus(401); //Unauthorized

    const decryptPwd = await bcrypt.compare(pwd, foundUser.password);

    if(decryptPwd){
        const accessToken = jwt.sign(
            {
               "UserInfo": {
                    "uid": foundUser.uid,
                    "email": foundUser.email,
                    "username": foundUser.username,
                    "role": foundUser.role 
               }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10m' }
        );

        const refreshToken = jwt.sign(
            { "uid": foundUser.uid },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);

        res.cookie('jwt', refreshToken , { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        res.json({ accessToken }); //store this in memory not in local storage
    }else{
        res.sendStatus(401);
    }
}

module.exports ={handleLogin}