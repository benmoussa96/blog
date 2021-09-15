const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const handleEvent = async (type, data) => {
    // RECEIVING EVENT COMMENT_CREATED
    if(type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';

        // EMMITING EVENT COMMENT_MODERATED
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                content: data.content,
                postId: data.postId,
                status
            }
        });
    };  
}

// LISTENING FOR EVENTS
app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.send({});
});

app.listen(4003, async () => {
    console.log('Listening on port 4003!');

    const res = await axios.get('http://event-bus-srv:4005/events');

    for (let event of res.data) {
        console.log('Processing event: ' + event.type);
        handleEvent(event.type, event.data);
    };
});