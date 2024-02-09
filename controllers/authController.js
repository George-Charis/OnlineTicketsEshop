const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
            { expiresIn: '30m' }
        );

        const refreshToken = jwt.sign(
            { "uid": foundUser.uid },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);

        const secretKey = process.env.UID_SECRET_KEY; 

        // Function to encrypt the UID
        const encryptUid = (uid) => {
            const iv = crypto.randomBytes(16); // Generate a random initialization vector
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
            let encryptedUid = cipher.update(uid, 'utf-8', 'hex');
            encryptedUid += cipher.final('hex');
            return { encryptedUid, iv: iv.toString('hex') };
        };

        const encryptedUid =  encryptUid(foundUser.uid);

        //store refresh token to a cookie
        res.cookie('jwt', refreshToken , { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        res.json({ accessToken , encryptedUid }); 
    }else{
        res.sendStatus(401);
    }
}

module.exports ={handleLogin}