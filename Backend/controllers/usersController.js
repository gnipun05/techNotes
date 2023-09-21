const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler'); // helps avoid try catch blocks
const bcrypt = require('bcrypt');

const getAllUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean(); // do not return password // lean will remove the functions and give us only the JSON data
    if(!users?.length){
        return res.status(400).json({message: 'No users found'});
    }
    return res.json(users);
})

const createNewUser = asyncHandler( async (req, res) => {
    const {username, password, roles} = req.body;
    
    // validate
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: 'All feilds are required'});
    }

    // check if user already exists
    const duplicate = await User.findOne({username}).lean().exec();

    if(duplicate)
        return res.status(409).json({message: 'Duplicate Username'});

    // hashed password
    const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

    const userObject = {username, "password": hashedPwd, roles}; // equivalent to: {"username": username, "password": hashedPwd, "roles": roles};

    // create and store new user
    const user = await User.create(userObject);

    if(user)
        res.status(201).json({message: `New user ${username} created`});
    else
        res.status(400).json({message: 'Invalid user data received'});
})

const updateUser = asyncHandler( async (req, res) => {
    const { id, username, roles, active, password} = req.body;

    // confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message: 'All feilds are required'});
    }

    const user = await User.findById(id).exec(); // we want .save() method from user; so we dont use .lean() here
     
    if(!user)
        return res.status(400).json({message: 'User not Found'});

    // check if username is already taken
    const duplicate = await User.findOne({username}).lean().exec();

    // Allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id)
        return res.status(409).json({message: 'Duplicate username'});

    // update user
    user.username = username;
    user.roles = roles;
    user.active = active;

    if(password){
        // hash password
        user.password = await bcrypt.hash(password, 10); // 10 salt rounds
    }

    const updatedUser = await user.save(); // since there was no .lean(), we have access to the functions like .save()

    res.json({message: `${updatedUser.username} updated`});
})

const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.body;

    if(!id)
        return res.status(400).json({message: 'User ID Required'});

    const note = await Note.findOne({user: id}).lean().exec();
    if(note){
        return res.status(400).json({message: 'User has notes. Delete notes first'});
    }

    const user = await User.findById(id).exec();

    if(!user)
        return res.status(400).json({message: 'User not Found'});

    const result = await user.deleteOne(); // it wont work if we used lean() on user

    const reply = `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply);
})

module.exports = {
    getAllUsers, 
    createNewUser,
    updateUser,
    deleteUser
}