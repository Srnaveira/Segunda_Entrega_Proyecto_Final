import express, { json } from 'express';
import { Router } from 'express'
import ProductManager from '../dao/products.manager.js'
import productsModel from '../models/products.model.js';

const router = express.Router();

const productManagment = new ProductManager();

router.get('/', async (req, res) => {
    let {limit = 10, page= 1, sort, query } = req.query
    limit = parseInt(limit);
    page = parseInt(page);
    try {
        let filter = {};
        if(query){
            filter = {
                $or: [
                    { category: query },
                    { status: query.toLowerCase() === 'true' } // Comparar como booleano
                ]
            };
        }

             // Opciones de sorteo
        let sortOptions = {};
        if (sort) {
           sortOptions.price = sort === 'asc' ? 1 : -1;
        }

        // Obtener el total de productos que coinciden con el filtro
        const totalProducts = await productsModel.countDocuments();
        // Calcular la paginación
        const totalPages = Math.ceil(totalProducts / limit);
        const offset = (page - 1) * limit;

        // Obtener productos paginados

        const products = await productsModel.find(filter)
            .sort(sortOptions)
            .skip(offset)
            .limit(limit)
            .lean()
        //console.log(products)
        // Construir la respuesta
        const response = {
            status: "success",
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}` : null
        };

        return res.status(200).render('products', response)

    } catch (error) {
        console.error("error al leer el archivo", error)
        res.status(500).json({ error: "Error interno del servidor" })
    }

})


router.get('/:pid', async (req, res) => {
    try {
        let pId = req.params.pid;
        const listproducts = await productManagment.getProductById(pId);
        if(listproducts){
            res.status(200).json(listproducts); 
        } else {
            res.status(404).json({message: "El producto Solicitado No existe"});
        }
    } catch (error) {
        console.log("hubo algun problema: ", error)
        res.status(500).json({ error: "Error interno del servidor" })
    }

})

router.post('/', async (req, res) => {
    try {
        const newProduct = req.body
        await productManagment.addProduct(newProduct)
        res.status(201).json({message: "Product Agregado Correctamente", product: newProduct});
    } catch (error) {
        console.error("Error al agregar el producto: ", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message});
    }
})

router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updateProduct = req.body;
        await productManagment.updateProduct(productId, updateProduct);
        // Envía una respuesta exitosa
        res.status(200).json({ message: "Producto actualizado correctamente."});
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        // Envía una respuesta con Error
        res.status(500).json({  message: "Error interno del servidor", error: error.message}); 
    }

})

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        await productManagment.deleteProduct(productId);
        res.status(200).json({message: "Producto borrado correctamente"})
    } catch (error) {
        console.error("Error al borrar el Producto", error)
        res.status(500).json({message: "Error interno del servidor", error: error.message})
    }

})

export default router;