const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {

    //check if access token is valid if yes return 200 else try to get a new one with the refresh token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            //if access token is not valid
            if(err){
                //check cookie for stored refresh token
                const cookies = req.cookies;
                if(!cookies?.jwt) return res.sendStatus(401);
                const refreshToken = cookies.jwt;
            
                //find user with the same refresh token as the cookie
                const foundUser = await User.findOne({ refreshToken }).exec();
                if(!foundUser) return res.sendStatus(403);
            
                //check if refresh token is valid if yes return a new access token if no user must login
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    (err, decoded) => {
                        if(err || foundUser.uid !== decoded.uid) return res.sendStatus(403);
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
            
                        res.json({ accessToken });
                    }
                );
            }           
            return res.sendStatus(200);
        }
    ) 
}

module.exports = {handleRefreshToken}