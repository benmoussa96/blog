const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

// CREATING A NEW POST
app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = {
        id, title
    };
    
    // EMITTING EVENT POST_CREATED
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id,
            title
        }
    });

    res.status(201).send(posts[id]);
});

// LISTENING FOR EVENTS
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    
    res.send({});
});

app.listen(4000, () => {
    console.log('Listening on port 4000!');
});