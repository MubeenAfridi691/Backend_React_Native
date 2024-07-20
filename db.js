
const mongoose = require('mongoose');
require('dotenv').config();

const db =mongoose.connect(process.env.MONGO_URL).then(
    () => {
        console.log('Connected to MongoDB');
    },
    err => {
        console.log('Error connecting to MongoDB', err);
    }
);