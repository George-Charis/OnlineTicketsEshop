const User = require('../model/User');
const bcrypt = require('bcrypt');
const {v4: uuid} = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const handleNewUser = async (req, res) => {

    //check if username, password and email are completed
    const {user, pwd, userEmail, isAdmin=false} = req.body;
    if(!user || !pwd || !userEmail) return res.status(400).json({ 'message': 'Username, email and password are required.'});

    const userid = uuid();
    //check if the email or the uid already exixt in the database
    const duplicateUid = await User.findOne({uid: userid}).exec();
    while(userid === duplicateUid){
        userid = uuid();
        duplicateUid = await User.findOne({uid: userid}).exec();
    }
    const duplicateEmail = await User.findOne({email: userEmail}).exec();
    if( duplicateEmail) return res.sendStatus(409); //Conflict

    try{
        //check if the isAdmin parameter is true in order the user to be an admin
        const role = isAdmin ? 5150 : 2001;

        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "uid": userid,
                    "email": userEmail,
                    "username": user,
                    "role": role
                 }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
            { "uid": userid },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        )

        //create and store the new user
        const result = await User.create({
            "uid": userid,
            "email": userEmail,
            "username": user,
            "role": role,
            "password": hashedPwd,
            "refreshToken": refreshToken
        });

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

        res.cookie('jwt', refreshToken , { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.status(201).json({ accessToken, encryptedUid });

    }catch(err){
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = {handleNewUser}