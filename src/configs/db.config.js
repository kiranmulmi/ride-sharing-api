const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const dbUrl = process.env.MONGO_DB_CONNECTION_STRING;
const connect = async () => {
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    db.on("error", () => {
        console.log("could not connect");
    });
    db.once("open", () => {
        console.log("> Successfully connected to https://cloud.mongodb.com/");
    });
};
module.exports = { connect };