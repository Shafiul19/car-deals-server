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

    // jwt token
    app.get('/jwt', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        if (user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
            return res.send({ accessToken: token });
        }
        console.log(user);
        res.status(403).send({ accessToken: '' })
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