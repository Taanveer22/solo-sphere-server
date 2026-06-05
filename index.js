require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.89rnkti.mongodb.net/?appName=Cluster0`;
// console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log('connect client to server');
    // =======================================================================
    const db = client.db('soloSphereDB');
    const jobsCollection = db.collection('jobsColl');

    // =======================================================================
    app.get('/jobs', async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/jobs/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post('/jobs', async (req, res) => {
      const doc = req.body;
      const result = await jobsCollection.insertOne(doc);
      res.send(result);
    });

    // =======================================================================
    // await client.db('admin').command({ ping: 1 });
    console.log('Send a ping to confirm a successful connection');
  } finally {
    // await client.close();
    console.log('Ensures that the client will close when you finish/error');
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
