import express from 'express'
import { forgotPassword, getMe, login, logout, register, resetPassword, updateAvatar, updateDetails, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from './../config/multer.config.js';


const router = express.Router();

router.get('/logout', logout);
router.get('/me', protect, getMe);

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword)

router.put('/resetpassword/:resettoken', resetPassword)

router.patch('/updatedetails', protect, updateDetails);
router.patch('/updateavatar', protect, upload.single('avatar'), updateAvatar)
router.patch('/updatepassword', protect, updatePassword);


export default router;