const mongoose = require('mongoose');
const config = require('config');

const MONGO_URI = process.env.MONGO_URI ||  config.get('MONGO_URI');

// connect DB
const connecDB = async () => {

    try {
       await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected Successfully!')
    } catch (error) {
        console.log('Unable to connect:', error.message);
    }
}

module.exports = connecDB;