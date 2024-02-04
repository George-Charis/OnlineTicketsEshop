require('dotenv').config();
const connectDB = require('./config/dbConnection');
const express = require('express');
const app = express();
const credentials = require('./middleware/credentials');
const cors = require('cors');
const path = require('path');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT;
const mongoose = require('mongoose');

connectDB();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use('/forgotPassword', express.static(path.join(__dirname, '/public')));

app.use('/register', require('./routes/register'));
app.use('/forgotPassword', require('./routes/forgotPassword'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/images', require('./routes/images'));
app.use('/order', require('./routes/api/orders'));

app.use('/users', require('./routes/api/users'));
app.use('/events', require('./routes/api/events'));


app.all('*', (req, res) => {
    res.sendStatus(404);
})

mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB server');
    app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});
})