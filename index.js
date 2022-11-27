const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config();


const port = process.env.PORT || 5000;

const app = express();


// middleware
app.use(cors());

app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xuxjswq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {
    const usersCollection = client.db('carDeals').collection('users');
    const categoriesCollection = client.db('carDeals').collection('categories');
    const productsCollection = client.db('carDeals').collection('products');
    const bookingsCollection = client.db('carDeals').collection('bookings')

    // All categories

    app.get('/catgories', async (req, res) => {
        const query = {};
        const categories = await categoriesCollection.find(query).toArray();
        res.send(categories)
    })
    // Categorized product
    app.get('/category/:id', async (req, res) => {
        const id = req.params.id;
        const query = { category: id };
        const result = await productsCollection.find(query).toArray();
        res.send(result)
    })

    // products
    app.get('/myproducts', async (req, res) => {
        const email = req.query.email;
        const query = { sellerEmail: email };
        const products = await productsCollection.find(query).toArray();
        res.send(products);
    })
    // deleting product from my product 
    app.delete('/myproducts/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(filter);
        res.send(result);
    })

    // advertised products

    app.get('/advertisedproduct', async (req, res) => {
        const query = { advertise: true, status: "available" }
        const advertisedproduct = await productsCollection.find(query).toArray();
        res.send(advertisedproduct);
    })


    // add products
    app.post('/products', async (req, res) => {
        const email = req.query.email;
        const query = { email: email, role: "seller" }
        const role = await usersCollection.findOne(query);
        const product = req.body;
        if (role) {
            const result = await productsCollection.insertOne(product);
            return res.send(result);
        }
        else {
            return res.status(403).send({ message: 'You are not a seller' })
        }
    })

    // update product
    app.put('/myproducts/:id', async (req, res) => {
        id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                advertise: true
            }
        }
        const result = await productsCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    })
    // booking get api 
    app.get('/bookings', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await bookingsCollection.find(query).toArray();
        res.send(result)
    })

    // booking post
    app.post('/booking', async (req, res) => {
        const email = req.query.email;
        const filter = { role: "buyer", email: email };
        const buyer = await usersCollection.findOne(filter)
        const booking = req.body;
        if (buyer) {
            const result = await bookingsCollection.insertOne(booking);
            return res.send(result);
        } else {
            return res.status(403).send({ message: 'You are not a buyer' })
        }
    })

    // All user
    app.get('/users', async (req, res) => {
        const query = {};
        const users = await usersCollection.find(query).toArray();
        res.send(users)
    })
    // all seller
    app.get('/allsellers', async (req, res) => {
        const query = { role: 'seller' }
        const allSeller = await usersCollection.find(query).toArray();
        res.send(allSeller)
    })
    // verify seller
    app.put('/verifyseller/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                verified: true
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
        const updateProduct = await productsCollection.updateMany({ sellerEmail: email }, updatedDoc, options);
        res.send(result);
    })
    // get reported products
    app.get('/reportedproduct', async (req, res) => {
        const query = { reported: true };
        const result = await productsCollection.find(query).toArray();
        res.send(result);
    })
    // report product
    app.put('/reportedproduct/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                reported: true
            }
        }
        const result = await productsCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    })
    //  all buyers

    app.get('/allbuyers', async (req, res) => {
        const query = { role: 'buyer' }
        const allBuyers = await usersCollection.find(query).toArray();
        res.send(allBuyers)
    })
    // delete buyer
    app.delete('/buyer/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await usersCollection.deleteOne(filter);
        res.send(result);
    })

    // delete seller 
    app.delete('/seller/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const result = await usersCollection.deleteOne(filter);
        res.send(result)
    })

    // Admin 

    app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const user = await usersCollection.findOne(query);
        res.send({ isAdmin: user?.role === 'admin' })
    })
    // seller
    app.get('/users/seller/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const user = await usersCollection.findOne(query);
        res.send({ isSeller: user?.role === 'seller' })
    })

    // save user to database
    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email };

        const existingUser = await usersCollection.find(query).toArray();

        if (existingUser.length) {
            return res.send({ acknowledged: false })
        }


        const result = await usersCollection.insertOne(user);
        res.send(result);
    })
}

run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('car deals server is running');
})

app.listen(port, () => {
    console.log(`car deals running on ${port}`);
})