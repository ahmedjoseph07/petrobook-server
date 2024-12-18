import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import Profile from "../models/profileModel.js"
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";

// const convertUserDataToPdf = async(userData) => {
//     const doc = new PDFDocument();
//     const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
//     const stream = fs.createWriteStream("uploads/" + outputPath);
//     doc.pipe(stream);

//     doc.image(`uploads/${userData.userId.profilePicture}`,{align:"right", width:100})
//     doc.fontSize(14).text(`Name : ${userData.userId.name}`);
//     doc.fontSize(14).text(`Username : ${userData.userId.username}`);
//     doc.fontSize(14).text(`Email : ${userData.userId.email}`);
//     doc.fontSize(14).text(`Bio : ${userData.bio}`);
//     doc.fontSize(14).text(`Current Position : ${userData.currentPost}`);

//     doc.fontSize(14).text(`Past Works :`);
//     userData.pastWork.forEach((work,index)=>{
//         doc.fontSize(14).text(`Company Name: ${work.company}`);
//         doc.fontSize(14).text(`Position : ${work.position}`);
//         doc.fontSize(14).text(`Years : ${work.years}`);
//     })
//     userData.education.forEach((item,index)=>{
//         doc.fontSize(14).text(`School: ${item.school}`);
//         doc.fontSize(14).text(`Degree : ${item.degree}`);
//         doc.fontSize(14).text(`Field : ${item.fieldOfStudy}`);
//     })

//     doc.end();

//     return outputPath;
// }
const convertUserDataToPdf = async (userData) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);
    doc.pipe(stream);

    if (userData.userId.profilePicture) {
        doc.image(`uploads/${userData.userId.profilePicture}`, {
            align: "center",
            width: 100,
            height: 100,
        });
    }

    doc.moveDown(3);

    doc.fontSize(18).font("Helvetica-Bold").text("User Profile", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(14).font("Helvetica").text(`Name: ${userData.userId.name}`, { continued: true });
    doc.moveDown(0.5);
    doc.text(`Username: ${userData.userId.username}`);
    doc.moveDown(0.5);
    doc.text(`Email: ${userData.userId.email}`);
    doc.moveDown(0.5);
    doc.text(`Bio: ${userData.bio}`);
    doc.moveDown(0.5);
    doc.text(`Current Position: ${userData.currentPost}`);

    doc.moveDown(1.5);

    doc.fontSize(16).font("Helvetica-Bold").text("Past Works:");
    doc.moveDown(0.5);

    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).font("Helvetica").text(`${index + 1}. Company: ${work.company}`, { indent: 20 });
        doc.text(`Position: ${work.position}`, { indent: 20 });
        doc.text(`Years: ${work.years}`, { indent: 20 });
        doc.moveDown(0.5);
    });

    doc.moveDown(1);

    doc.fontSize(16).font("Helvetica-Bold").text("Education:");
    doc.moveDown(0.5);

    userData.education.forEach((item, index) => {
        doc.fontSize(14).font("Helvetica").text(`${index + 1}. School: ${item.school}`, { indent: 20 });
        doc.text(`Degree: ${item.degree}`, { indent: 20 });
        doc.text(`Field of Study: ${item.fieldOfStudy}`, { indent: 20 });
        doc.moveDown(0.5);
    });

    doc.moveDown(2);

    doc.end();

    return outputPath;
};


export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({
            email
        })
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });
        await newUser.save();
        const profile = new Profile({ userId: newUser._id });
        await profile.save();
        return res.json({ message: "User created successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });
        const user = await User.findOne({ email });
        if (!user) { return res.status(404).json({ message: "User does not exist" }) };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = crypto.randomBytes(32).toString("hex");

        await User.updateOne({ _id: user._id }, { token });
        return res.json({ token });
    } catch (err) {
        return res.json({ message: "Something went wrong" });
    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    try {
        console.log('File:', req.file);
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.file) {
            user.profilePicture = req.file.filename;
            await user.save();
            return res.json({ message: "Profile picture updated successfully", filename: req.file.filename });
        } else {
            return res.status(400).json({ message: "No file uploaded" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { username, email } = newUserData;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser || String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "User already exist" });
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "User updated" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture');
        return res.json(userProfile);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;
        const userProfile = await User.findOne({ token });
        if (!userProfile) {
            return res.status(404).json({ message: "User not found" });
        }
        const profileToUpdate = await Profile.findOne({ userId: userProfile._id });
        Object.assign(profileToUpdate, newProfileData);
        await profileToUpdate.save();
        res.json({ message: "Profile updated" });
    } catch (err) {
        return res.status(500).json({ message: "err.message" });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name username email profilePicture');
        return res.json({ profiles });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const downloadResume = async (req, res) => {
    const userId = req.query.id;
    const userProfile = await Profile.findOne({ userId: userId })
        .populate('userId', 'name username email profilePicture');

    let outputPath = await convertUserDataToPdf(userProfile);
    return res.json({ "message": outputPath });
}