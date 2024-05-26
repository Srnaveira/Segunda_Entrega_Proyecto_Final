import mongoose from "mongoose";

const cartsCollection = 'carts';

const cartsSchema = new mongoose.Schema({
    product: [{
        idP: { type: mongoose.Schema.Types.ObjectId, ref: 'products' }, // Referencia al modelo Products
        quantity: { type: Number }
    }]
});

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

export default cartsModel;