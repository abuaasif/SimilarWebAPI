const express = require('express');
require('dotenv').config();

const cors = require('cors');
const bodyParser = require('body-parser');
const similarwebRouer = require('./routers/similarwebRouter'); // Import router file

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', similarwebRouer );

app.use(`${process.env.BACKGROUND_IMAGE}`,express.static(`${process.env.BACKGROUND_IMAGE}`) );

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
