import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

// someone is making request -> authorized middleware -> verify -> if valid -> next -> get user details

const authorize = async (req, res, next) => {
    try {
        let token;

        // find the user based off the token the user is trying to make the request
        // sees if its there, decodes it and verifies its the user and attach it to request
        //
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // returns second part of string
        }

        if(!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET)

        const user = await User.findById(decoded.userId);
        
        if(!user) return res.status(401).json({ message: 'Unauthorized' });

        // we know who is making the reqest 
        req.user = user;

        // push to next function, see user.routes.js middleware comments
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message})
    }
}


export default authorize;