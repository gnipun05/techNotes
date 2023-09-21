const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // the type is an object id from another Schema (though info about that other Schema is not defined here)
            required:true,
            ref: 'User', // the name of the other Schema (the one that this property of this Schema is referring to)
        },
        title: {
            type: String, 
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    }, 
    {
        timestamps: true, // will give both created and updated timestamps for each document by just adding this line here
    }
);

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket', // increment field will be named as ticket
    id: 'ticketNums', // we wont see this field in the Notes Collection, but we will see it in the Counter Collection
    start_seq: 500 // the first ticket number will be 500
})

module.exports = mongoose.model('Note', noteSchema);