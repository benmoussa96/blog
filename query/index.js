const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

// GETTING THE LIST OF ALL POSTS WITH COMMENT
app.get('/posts', (req, res) => {
    res.send(posts);
});

const handleEvent = (type, data) => {
    // RECEIVING EVENT POST_CREATED
    if (type === 'PostCreated') {
        const { id, title } = data;

        posts[id] = {
            id,
            title,
            comments: []
        };
    };

    // RECEIVING EVENT COMMENT_CREATED
    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        post.comments.push({ id, content, status });
    };

    // RECEIVING EVENT COMMENT_UPDATED
    if(type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment =  post.comments.find(comment => {
            return comment.id ==  id;
        });

        comment.content = content;
        comment.status = status;
    };
};

// LISTINING FOR EVENTS
app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.send({});
});

app.listen(4002, async () => {
    console.log('Listening on port 4002!');

    const res = await axios.get('http://event-bus-srv:4005/events');

    for (let event of res.data) {
        console.log('Processing event: ' + event.type);
        handleEvent(event.type, event.data);
    };
});