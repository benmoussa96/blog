const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

// GETING THE LIST OF ALL COMMENTS BY POST_ID
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// CREATING A NEW COMMENT
app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    const newComment = { id: commentId, content, postId: req.params.id, status: 'pending' };
    
    comments.push({ ...newComment });

    commentsByPostId[req.params.id] = comments;

    // EMITTING EVENT COMMENT_CREATED
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: { ...newComment }
    })

    res.status(201).send(comments);
});

// LISTENING FOR EVENTS
app.post('/events', async (req, res) => {
    const { type, data }  = req.body;

    // RECEIVING EVENT COMMENT_MODERATED
    if(type === 'CommentModerated') {
        const { id, content, postId, status } = data;

        const comments = commentsByPostId[postId];

        const  comment = comments.find(comment => {
            return comment.id == id;
        });
        comment.status = status;

        // EMITTING EVENT COMMENT_UPDATED
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                content,
                postId,
                status
            }
        })
    }

    res.send({});
});

app.listen(4001, () => {
    console.log('Listening on port 4001!');
});