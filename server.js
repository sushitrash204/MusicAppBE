require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const { connectToDb, getDb } = require('./src/config/database');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

connectToDb((err) => {
    if (!err) {
        app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
        });
    } else {
        console.error('Failed to connect to database', err);
    }
});
