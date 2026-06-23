require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// instance
const port = process.env.PORT || 5000;
const app = express();

// middlewars
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyJwt = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      // console.log(error);
      return res.status(403).send({ message: 'forbidden access' });
    }
    console.log(decoded);
    req.decodedPayload = decoded;
    next();
  });
};

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
    const bidsCollection = db.collection('bidsColl');

    // =======================================================================
    app.post('/jwt/login', (req, res) => {
      const payload = req.body;
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    app.get('/jwt/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 0,
        })
        .send({ success: true });
    });

    // =======================================================================
    app.get('/paginationJobs', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 5;
      const filter = req.query.filter;
      const sort = req.query.sort;
      console.log(req.query);

      let query = {};
      if (filter) {
        query = { category: filter };
      }
      console.log(query);

      let sortOptions = {};
      if (sort === 'asc') {
        sortOptions = { deadline: 1 };
      } else if (sort === 'dsc') {
        sortOptions = { deadline: -1 };
      }
      console.log(sortOptions);

      const jobsData = await jobsCollection
        .find(query)
        .sort(sortOptions)
        .skip(page * size)
        .limit(size)
        .toArray();

      const jobsDataCount = await jobsCollection.countDocuments(query);

      res.send({ jobsData, jobsDataCount });
    });

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

    app.get('/jobs/table/:email', verifyJwt, async (req, res) => {
      if (req?.decodedPayload?.email !== req?.params?.email) {
        return res.status(401).send({ message: 'forbidden acess' });
      }
      const query = { 'buyer.email': req.params.email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/jobs', async (req, res) => {
      const doc = req.body;
      const result = await jobsCollection.insertOne(doc);
      res.send(result);
    });

    app.put('/jobs/table/:id', async (req, res) => {
      const jobData = req.body;
      const query = { _id: new ObjectId(req.params.id) };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const options = { upsert: true };
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.delete('/jobs/table/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    // =======================================================================
    app.get('/bids/table/:email', verifyJwt, async (req, res) => {
      if (req?.decodedPayload?.email !== req.params.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { freelancerEmail: req.params.email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/bids/dashboard/:email', verifyJwt, async (req, res) => {
      if (req?.decodedPayload?.email !== req.params.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { buyerEmail: req.params.email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/bids', async (req, res) => {
      const query = {
        freelancerEmail: req.body.freelancerEmail,
        jobId: req.body.jobId,
      };
      const alreadyApplied = await bidsCollection.findOne(query);
      console.log(alreadyApplied);
      if (alreadyApplied) {
        return res.status(400).send({ message: 'You have already placed this bid' });
      }
      const doc = req.body;
      const result = await bidsCollection.insertOne(doc);
      res.send(result);
    });

    app.patch('/bids/dashboard/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const updateDoc = {
        $set: { status: req.body.status }, // ✅ descriptive clear key
      };
      const result = await bidsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete('/bids/table/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await bidsCollection.deleteOne(query);
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
