import { Router } from "express";
import multer from "multer";
import {
    register,
    login,
    getAllUserProfile,
    uploadProfilePicture,
    updateUserProfile,
    getUserAndProfile,
    updateProfileData,
    downloadResume
} from "../controllers/userController.js";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage });

router.route('/update_profile_picture').post(upload.single('profile_picture'), uploadProfilePicture);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);
router.route('/update_profile_data').post(updateProfileData);
router.route('/user/get_all_users').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadResume);

export default router;


