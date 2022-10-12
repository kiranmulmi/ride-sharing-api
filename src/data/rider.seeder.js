require('dotenv').config();
const db = require("../configs/db.config");
const { userType } = require("../constants/user.constant");
const User = require("../models/user.model");
try {
    async function start() {
        if (!process.argv[2]) {
            throw new Error("Please provide seed JSON file from data/seeds/");
        }
        await db.connect();
        const data = require('./seeds/' + process.argv[2] + '.json');
        console.log("Seeding riders data to database...");
        for await (const row of data) {
            let existingUser = await User.findOne({ 'email': row.email });
            if (existingUser) {
                // await existingUser.delete();
                console.log(`Rider ${row.email} already exists`);
                continue;
            }
            const [lat, lng] = row.location.split(",");
            const json = {
                name: row.name,
                email: row.email,
                type: userType.RIDER,
                active: 1,
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                provider: {
                    id: "",
                    name: "seed"
                }
            }
            const newUser = new User(json);
            await newUser.save();
            console.log(`${row.email} success`);
        }
    
        console.log("Finished");
        process.exit();
    }
    start();
} catch (e) {
    console.log(e.message)
}
