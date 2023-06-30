// import express
const express = require('express');
// import path
const path = require('path');
// set up port configuration so it will work with heroku
const PORT = process.env.PORT ?? 3001;
// set up instance of express as app
const app = express();

// direct app to use public directory for static files 
app.use(express.static('public'));

// GET /notes returns notes.html
app.get('/notes', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/notes.html'));
});

//  GET * returns index.html; placed at bottom so wildcard does not replace other paths
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});


// set up listener to confirm port / application is active
app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
})