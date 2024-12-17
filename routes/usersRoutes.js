import { Router } from "express";
import { register, login } from "../controllers/userController.js";
import { uploadProfilePicture,updateUserProfile,getUserAndProfile } from "../controllers/userController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null,file.originalname);
    }
})
const upload = multer({storage});

router.route('/update_profile_picture').post(upload.single('profile_picture'), uploadProfilePicture);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_user_and_profile').get(getUserAndProfile);


export default router;


