import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRoutes from "./routes/postsRoutes.js";
import userRoutes from "./routes/usersRoutes.js"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/api/v1", postsRoutes);
app.use("/api/v1", userRoutes);
app.use(express.static("uploads"))


const start = async () => {
    const connectToDb = await mongoose.connect("mongodb+srv://ahmedjoseph07:ahmedjoseph07@petrobook.debw1.mongodb.net/petrobook?retryWrites=true&w=majority&appName=petrobook");
    console.log("DB Connected")
    app.listen(9090, () => {
        console.log("Server running on 9090");
    });
}
start();