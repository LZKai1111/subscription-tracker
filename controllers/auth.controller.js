import mongoose from 'mongoose';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
// What is a req body -> req.body is an object containing data from the client (POST request)

export const signUp = async(req, res, next) => {
    // Implement the sign up login here
    // its a session of a mongoose transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // Atomic operation: database operations that 
    // either works completely or it doesn't. No half operation

    try {
        // Logic to create a new user
        const { name, email, password } = req.body;
        
        // Check if a user already exist
        const existingUser = await User.findOne({ email });

        if(existingUser) {
            const error = new Error('User already exist');
            error.statusCode = 409;
            throw error;
        }

        // If doesn't exist, hash password for new user
        // never store password in plain text

        // randomizing hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // attached session if something goes wrong and transaction aborts, the user will not be created
        // if triblock, the transaction commits which will create user
        const newUsers = await User.create([{ name, email, password: hashedPassword }], {session})

        // attaching jsonWebToken to user with the following Id
        const token = jwt.sign({ userId: newUsers[0]._id },  JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0],
            }
        }))
        
    } catch (error) {
        // If something goes wrong, abort transaction and end session immediately
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
        
        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        })
    } catch (error) {
        // forward to error handling middleware
        next(error)
    }
}

export const signOut = async(req, res, next) => {

}