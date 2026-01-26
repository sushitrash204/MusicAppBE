require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const { connectToDb, getDb } = require('./src/config/database');
const uploadCloud = require('./src/config/cloudinary');

const cloudinary = require('cloudinary').v2;

connectToDb((err) => {
    if (!err) {
        app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
            cloudinary.api.ping()
                .then(result => console.log('Cloudinary connection status:', result.status))
                .catch(error => console.error('Cloudinary connection failed:', error.message));
        });
    } else {
        console.error('Failed to connect to database', err);
    }
});
