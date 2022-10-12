const express = require('express');
const bodyParser = require('body-parser');
const passport = require("passport");
// const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config();

require("./configs/passport.setup");

const app = express();
const db = require("./configs/db.config");

db.connect();
app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

const port = process.env.PORT || 4000;

require('./routes').addRoutes(app);

app.listen(port, () => {
  console.log(`server started at ${process.env.HOST_URL}`)
})