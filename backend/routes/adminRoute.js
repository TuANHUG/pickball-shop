import express from 'express';
import { adminLogin, adminLogout, getAdminData } from "../controllers/adminController.js";
import { verifyAdmin } from '../middleware/authMiddleware.js';

const adminRouter = express.Router();
adminRouter.post('/login', adminLogin);
adminRouter.post('/logout' , adminLogout);
adminRouter.get('/deshboard', verifyAdmin , getAdminData);

export default adminRouter;