import express from 'express';
import { __dirname } from './utils.js';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import CartsManagment from './dao/carts.manager.js';
import viewRoutes from './routes/view.routes.js';
import ProductManager from './dao/products.manager.js';
import dotenv from 'dotenv';
const PORT = 8080;

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));

dotenv.config()

app.use('/api/products/', productsRouter);
app.use('/api/carts/', cartsRouter);
app.use('/', viewRoutes)


const httpServer = app.listen(PORT, () =>{
    console.log(`Listening on PORT: ${PORT}`)

})

const pManager = new ProductManager();
const cManager = new CartsManagment();


mongoose.connect(process.env.MONGO_URL)
    .then(() =>{ console.log("Conexion sucefull")})
    .catch((error) => {console.error("Error en conexion con la BD", error)})


const socketServer = new Server(httpServer);


socketServer.on('connection', socket =>{
    console.log("Nuevo cliente conectado");

        socket.on('message', data =>{
                console.log(data);
        })
    
        pManager.loadProducts()
          .then((products) =>{
                socket.emit('listProducts', products)
        })       
    
        socket.broadcast.emit('message_user_conect', "Ha Ingresado un nuevo USUARIO")
        socketServer.emit('event_for_all', "Este evento lo veran todos los usuarios")

    
        socket.on('productAdd', async (product) =>{
            try {
                   const addIsValid = await pManager.addProduct(product)
                   if(addIsValid){
                            await pManager.loadProducts()
                            .then((products) =>{
                                    socket.emit('listProducts', products);
                                    socket.emit('message_add', "Producto Agregado")
                            })      
                    }
            } catch (error) {
                    socket.emit('message_add', "Error al agregar el producto: " + error.message)
            }
    
    })
    


        socket.on('productDelete',  async (pid) =>{
            try {
                    const Productexist = await pManager.getProductById(pid)
    
                    if(Productexist){
                            await pManager.deleteProduct(pid)
                            await pManager.loadProducts()
                            .then((products) =>{
                                    socket.emit('listProducts', products);
                                    socket.emit('message_delete', "Producto Eliminado")
                          })  
                    }
            } catch (error) {
                    socket.emit('message_delete', "Error al Eliminar el producto: " + error.message)
    
            }

        })

            
        socket.on('add_Product_cart', async (productId) => {
                try {
                     const quantity = 1;   
                     const listCarts = await cManager.loadCarts()        
                     const randomCart = Math.floor(Math.random() * listCarts.length);
                     const cartAdd = listCarts[randomCart]
                     console.log(productId)
                     console.log(randomCart)
                     console.log(listCarts[randomCart])
                     
                     await cManager.addProductToCart(cartAdd, productId, quantity)
                     socket.emit('productAdded', { message: "El producto se agrego correctamente" });
                } catch (error) {
                     socket.emit('productAdded', "Error al agregar el producto al cart selecionado: " + error.message)  
                }
        })

})

