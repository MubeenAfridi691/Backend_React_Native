const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = 3000;
const Authroute = require('./routers/Authroute'); // Corrected require statement

app.use(bodyParser.json());
require('./db');
require('./model/user');

app.use(Authroute);

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
