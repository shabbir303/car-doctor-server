const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// console.log(process.env.DB_PASS)

// mongodb server
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zm5ln60.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('booking');

        // booking
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            //    res.send(booking);
            const cursor = await bookingCollection.insertOne(booking);
            res.send(cursor);
        })

        app.get('/booking', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = await bookingCollection.find(query).toArray();
            res.send(cursor);
        })

        app.delete('/booking', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const cursor = await bookingCollection.deleteOne(query);
            res.send(cursor);
        })

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // single data serch
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            //   if we need specific data
            const options = {
                projection: { _id: 0, title: 1, service_id: 1, price: 1, img: 1 },
            };
            const cursor = await serviceCollection.findOne(query, options);
            res.send(cursor);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('doctor is running');
})

app.listen(port, () => {
    console.log(`car server is running on port: ${port}`);
})