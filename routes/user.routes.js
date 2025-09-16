import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js'
import { getUser, getUsers } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', getUsers)

// (authorize) is called middleware because its in the middle
// from when the request to when it ends
// can add more middleware bettwen authorize and getUser and chain together
// using next() at the end of the middleware
userRouter.get('/:id', authorize, getUser)

userRouter.post('/', (req, res)=>{
    res.send({title: 'CREATE new user'})
})

userRouter.put('/:id', (req, res)=>{
    res.send({title: 'Update user'})
})

userRouter.delete('/:id', (req, res)=>{
    res.send({title: 'DELETE user'})
})

export default userRouter;