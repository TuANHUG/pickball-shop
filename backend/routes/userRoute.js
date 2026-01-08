import express from 'express';
import { userLogin, registerUser, getUserData, userLogout, getAllUsers, deleteUser, updateUserStatus } from '../controllers/userController.js';
import { verifyUser, verifyAdmin } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', userLogin);
userRouter.get('/deshboard', verifyUser, getUserData);
userRouter.post('/logout', verifyUser, userLogout);
userRouter.get('/all-users', verifyAdmin, getAllUsers);
userRouter.post('/delete-user', verifyAdmin, deleteUser);
userRouter.post('/update-user-status', verifyAdmin, updateUserStatus);

export default userRouter;