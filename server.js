// import express
const express = require('express');
// import path
const path = require('path');
// import fs for file reading/writing
const fs = require('fs');
// import db.json file
const db = require('./db/db.json');
// set up port configuration so it will work with heroku
const PORT = process.env.PORT ?? 3001;
// set up instance of express as app
const app = express();

// install middleware to parse json/application and urlencoded body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// direct app to use public directory for static files 
app.use(express.static('public'));

// GET /notes returns notes.html
app.get('/notes', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/notes.html'));
});
// get /api/notes returns all notes in db.json
app.get('/api/notes', (req, res) => {
    return res.json(db);
});

// POST to /api/notes adds a note to the db.json file 
app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request received to add note.`);
    
    const newNote = req.body;
        const original = fs.readFileSync('db/db.json', 'utf8');
        const parsedNotes = JSON.parse(original);
        parsedNotes.push(newNote);
        const stringNotes = JSON.stringify(parsedNotes, null, 4);

        fs.writeFile('db/db.json', stringNotes, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`New note '${req.body.title}: ${req.body.text}' added successfully!`);
            }
        })
    return res.json(newNote);
    }
     
);

//  GET * returns index.html; placed at bottom so wildcard does not replace other paths
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});


// set up listener to confirm port / application is active
app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
});