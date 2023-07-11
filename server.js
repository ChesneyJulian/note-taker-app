// import express
const express = require('express');
// import path
const path = require('path');
// import fs for file reading/writing
const fs = require('fs');
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
    // read original so it grabs a fresh version with each get
    const original = fs.readFileSync('db/db.json', 'utf8');
    // parse original db file into json
    const parsedNotes = JSON.parse(original);
    return res.json(parsedNotes);
});

// POST to /api/notes adds a note to the db.json file 
app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request received to add note.`);
    // destructure input for title and text from req.body to be used in newEntry
    const { title, text } = req.body;
    // create new entry using title, text, and express uuid v4
    const newEntry = {
        title,
        text,
        id: uuidv4()
    };
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

// DELETE note by id in api/notes path
app.delete('/api/notes/:id', (req, res) => {
    console.log(`${req.method} request received.`);
    // assign id to the value of the reqest parameters :id
    const { id } = req.params; 
    // read original db file and assign to originalEntries
    const originalEntries = fs.readFileSync('db/db.json', 'utf8');
    // parse originalEntries to JSON
    const parsedEntries = JSON.parse(originalEntries);
    // create function to return true for entries that dont have id's matching the req params
    function notDeleting (entry) {
        return (entry.id !== id);
    };
    // update entries by filtering using notDeleting function
    const updated = parsedEntries.filter(notDeleting);
    // convert updated entries to formatted string
    const stringEntries = JSON.stringify(updated, null, 4);
    // rewrite stringified updated entries to db.json
    fs.writeFileSync('db/db.json', stringEntries);
    // respond with json format of updated entries
    return res.json(updated);
})

//  GET * returns index.html; placed at bottom so wildcard does not replace other paths
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});


// set up listener to confirm port / application is active
app.listen(PORT, () => {
    console.log(`Application is running @ http://localhost:${PORT}`);
});