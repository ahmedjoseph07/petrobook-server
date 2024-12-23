import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status_accepted:{
        type:Boolean,
        default:null
    }
})

const ConnectionRequest = mongoose.model("ConnectionsRequest",connectionRequestSchema);

export default ConnectionRequest;