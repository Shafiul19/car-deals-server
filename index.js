const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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

    // All categories

    app.get('/catgories', async (req, res) => {
        const query = {};
        const categories = await categoriesCollection.find(query).toArray();
        res.send(categories)
    })
    // products
    app.post('/products', async (req, res) => {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.send(result);
    })

    // All user
    app.get('/users', async (req, res) => {
        const query = {};
        const users = await usersCollection.find(query).toArray();
        res.send(users)
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