// import express
const express = require('express');
// import path
const path = require('path');
// import fs for file reading/writing
const fs = require('fs');
// import db.json file
const db = require('./db/db.json');
// import uuid v4 from express
const { v4: uuidv4 } = require('uuid');
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
    // trim input for title and text to be used in newEntry
    const title = req.body.title.trim();
    const text = req.body.text.trim();
    // create new entry using title, text, and express uuid v4
    const newEntry = {
        title,
        text,
        id: uuidv4()
    }
    console.log(newEntry);
    // read original notes from db file
    const original = fs.readFileSync('db/db.json', 'utf8');
    // parse original db file into json
    const parsedNotes = JSON.parse(original);
    // push newEntry into parsed notes to add newest note to json
    parsedNotes.push(newEntry);
    // convert parsed notes into formatted string
    const stringNotes = JSON.stringify(parsedNotes, null, 4);

    // write file to db.json using stringified notes 
    fs.writeFile('db/db.json', stringNotes, (err) => {
        // add conditional to console.error if err occurs
        if (err) {
            console.error(err);
        } else {
            // if err doesnt occur, console log message describing the note added to db.json
            console.log(`New note '${req.body.title}: ${req.body.text}' added successfully!`);
        }
    })
    // return newEntry in json
    return res.json(newEntry);
    }
     
);

app.delete('/api/notes/:id', (req, res) => {
    console.log(`${req.method} request received.`);
    const { id } = req.params;
    for (let i = 0; i < db.length; i++) {
        if(id == db[i].id) {
            const found = res.json(db[i]);
            const entries = fs.readFileSync('db/db.json');
            const parsedEntries = JSON.parse(entries);
            const updatedEntries = delete parsedEntries[i];
            const stringEntries = JSON.stringify(updatedEntries, null, 4);
            fs.writeFileSync('db/db.json', stringEntries);
        }
        return res.json(db);
    }
    
})

//  GET * returns index.html; placed at bottom so wildcard does not replace other paths
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});


// set up listener to confirm port / application is active
app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
});