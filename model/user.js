const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profile_pic: {
        type: String,
        default: ''
    },
    post: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },description: {
        type: String,
        default: ''
    }
    
});

 module.exports = mongoose.model('user', user);

 user.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
       next();
    }
   
    user.password = await bcrypt.hash(user.password, 10);
    console.log(user.password);
    next();
 });
 