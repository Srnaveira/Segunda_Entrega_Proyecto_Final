import mongoose from "mongoose";

const cartsCollection = 'carts';

const cartsSchema = new mongoose.Schema({
    product:[{
        idP: { type: String },
        quantity: {type: Number }
    }]
})

const cartsModel = mongoose.model(cartsCollection, cartsSchema);


export default cartsModel;