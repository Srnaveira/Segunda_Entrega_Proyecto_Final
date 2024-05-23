import { Router } from 'express';
import { __dirname } from "../utils.js"
import ProductManager from '../dao/products.manager.js';
import express from 'express';

const router = express.Router();

const pManager = new ProductManager();


router.get('/', async (req, res) => {
    const listProducts = await pManager.getProducts();
    console.log({listProducts})
    res.render('home', {listProducts}) 
});


router.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts', {});

});


export default router;