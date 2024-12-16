import { Router } from "express";
import { register, login } from "../controllers/userController.js";
import { uploadProfilePicture } from "../controllers/userController.js";
const router = Router();
import multer from "multer";

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

export default router;


