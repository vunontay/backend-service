"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check-connect");
const {
    db: { host, name, port },
} = require("../configs/config-mongodb");

const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
    constructor() {
        this.connect();
    }
    // Connect
    connect(type = "mongodb") {
        // Development
        if (1 === 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }
        mongoose
            .connect(connectString, {
                maxPoolSize: 50,
            })
            .then((_) => {
                countConnect();
            })
            .catch((err) => console.error(`Error connecting to Mongodb:`, err));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
