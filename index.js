const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

require('dotenv').config();
const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

app.use(express.json());


//SoloSphere
//it9EkQBxwUQQqlCs

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iepmiic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const jobCollections = client.db("SoloSphere").collection("jobs");
        const bidCollections = client.db("SoloSphere").collection("bids");


        app.get('/jobs', async (req, res) => {
            const result = await jobCollections.find().toArray();

            res.send(result);
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobCollections.findOne(query);

            res.send(result);
        })

        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobCollections.deleteOne(query);

            res.send(result);
        })

        // update a job in db
        app.put('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const jobData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...jobData,
                },
            }
            const result = await jobCollections.updateOne(query, updateDoc, options)
            res.send(result)
        })

        app.get('/postedJobs/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { 'buyer.email': email };
            const result = await jobCollections.find(query).toArray();

            console.log(result);

            res.send(result);
        })


        app.post('/bids', async (req, res) => {
            const bid = req.body;
            console.log(bid);
            const result = await bidCollections.insertOne(bid);
            res.send(result);
        })

        app.post('/jobs', async (req, res) => {
            const job = req.body;
            console.log(job);
            const result = await jobCollections.insertOne(job);
            res.send(result);
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
    res.send('Solosphere is on');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})