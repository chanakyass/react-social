const express = require('express');
const cookieParser = require('cookie-parser');
const postsRouter = require('./endpoints/post');
const commentsRouter = require('./endpoints/comment');
const likesRouter = require('./endpoints/likes');
const userRouter = require('./endpoints/user');

const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(cookieParser());

app.use('/api/v1',commentsRouter);
app.use('/api/v1',likesRouter);
app.use('/api/v1',userRouter);
app.use('/api/v1',postsRouter);


const port = process.env.PORT || 8080;
app.listen(port);

console.log('App is listening on port ' , port, __dirname);