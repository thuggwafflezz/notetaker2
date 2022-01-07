const express = require('express')
const app = express()
const path = require('path')
const { readFromFile,
        readAndAppend,
        writeToFile, } = require ('./helpers/fsUtils')
const uuId = require('./helpers/uuid')
const PORT = process.env.PORT || 3001;


//Middleware to parse JSON
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

//Get route for homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

//get route for notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
})

//get route for /api/notes to read db.json and return all saved notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received to view notes`)
    readFromFile('./db/db.json')
    .then((data) => res.json(JSON.parse(data)))
})

//post route for /api/notes to add a new note to db.json
app.post('/api/notes', (req, res) => {
    console.log(req.body)

    //destructing for items in req.body
    const { title, text, } = req.body

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuId()
        };
        readAndAppend(newNote, './db/db.json')
        res.json(`new note added successfully`)
    } else {
        console.log('no new notes posted')
    }
})

//delete route for /api/notes to remove a record by specific id
app.delete('/api/notes/:id', (req, res) => {
    console.info(req.method)
    const delNoteID = req.params.id
    readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
        //the result will be returned as an array with all of the notes except the note with id that was passed in as a param
        const result = json.filter((note) => note.id !== delNoteID)
        console.log(result)

        //re-write the result array to db.json
        writeToFile('./db/db.json', result)

        //response to let client know delete request has been completed
        res.json(`note with ${delNoteID} has been deleted`)
    })
})

//Get route for *
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

//listening on port
app.listen(PORT, () =>
console.log(`app listening at http://localhost:${PORT}`))