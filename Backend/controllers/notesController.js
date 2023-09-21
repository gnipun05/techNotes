const User = require ('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler (async (req, res) => {
    const notes = await Note.find().lean();

    if(!notes?.length){
        return res.status(400).json({message: 'No notes found'});
    }

    let notesWithUser = async (notes) => {
        let notesWithUsername=[]
        for(let note of notes){
            const user = await User.findById(note.user).lean().exec();
            note={...note, username: user.username};
            notesWithUsername.push(note);
        }
        return notesWithUsername;
    }
    
    // Below given Snippet is using Promise.all() method
    // const notesWithUser = await Promise.all(notes.map(async (note) => {
        //     const user = await User.findById(note.user).lean().exec()
        //     return { ...note, username: user.username }
        // }))
        // return res.json(notesWithUser);
        
        
    return res.json(await notesWithUser(notes));
});

const createNewNote = asyncHandler (async (req, res) => {
    const {user, title, text} = req.body;

    if(!user || !title || !text){
        return res.status(400).json({message: 'All fields are required'});
    }

    // const isUser = await User.findById(user).lean().exec();
    // if(!isUser){
    //     return res.status(400).json({message: 'User not found'});
    // }

    const duplicate = await Note.findOne({title}).lean().exec();
    if(duplicate){
        return res.status(409).json({message: 'Duplicate note title'});
    }

    const noteObject = {user, title, text};
    const note = await Note.create(noteObject);

    if(note)
        res.status(201).json({message: `New note ${title} created`});
    else
        res.status(400).json({message: 'Invalid note data received'});
});

const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
});


const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
});

module.exports = {
    getAllNotes, 
    createNewNote,
    updateNote,
    deleteNote
};