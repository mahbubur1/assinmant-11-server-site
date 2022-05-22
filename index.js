require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();


app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );
app.use(express.json());

function verifyJWT(req, res, next) {
    const tokenInfo = req.headers.authorization;

    if (!tokenInfo) {
        return res.status(401).send({ message: 'Unouthorize access' })
    }
    const token = tokenInfo.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}



const uri = "mongodb+srv://mahbuburRhaman:pF0kvXWltvgH4UMW@cluster0.eonms.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {

    try {
        await client.connect();
        const fruitCollection = client.db('stock').collection('fruit');

    
        app.post('/login', (req, res) => {
        const email = req.body;
        const token = jwt.sign(email, process.env.SECRET_KEY)
        res.send({ token });
})


        app.put('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const updateFruit = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateFruit.name,
                    price: updateFruit.price,
                    shortDescription: updateFruit.shortDescription,
                    image: updateFruit.image,
                    quantity: updateFruit.quantity,
                    serviceProvider: updateFruit.serviceProvider,
                    email: updateFruit.email
                }
            }
            console.log(updateFruit);
            const result = await fruitCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result)
        })


        app.get('/myFruits', async (req, res) => {
            const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;
            if (email === decodedEmail){
            const query = { userEmail: email };
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);

            }

            else {
                res.status(403).send({ message: 'Forbidden access' })
            }
            
        })

        app.get('/fruits', async (req, res) => {
            const pageNumber = Number(req.query.pageNumber);
            const limit = Number(req.query.limit);
            const count = await fruitCollection.estimatedDocumentCount();
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })


        app.post('/fruits',  async (req, res) => {
            const newItem = req.body;
            const result = await fruitCollection.insertOne(newItem);
            res.send(result);
        })

      console.log("bangladesh"); 

    }
    finally {
        // client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log('Backend server running port', port);
})