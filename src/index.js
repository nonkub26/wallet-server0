require('dotenv').config({ path: './config.env'});
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

const userRouter = require('./routes/user.route');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require("./db.js")(app);

app.get("/", (req, res) => {
  res.send("จะจบไหมเนี่ยยยยยย");
});


app.use("/user", userRouter);

app.listen(port, () => {
  console.log("Starting node.js at port " + port);
});