"use strict";
const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const INTERVAL_SECONDS = 5000; // 5 seconds
const MAX_CONNECTIONS_PER_CORE = 5;

// Count connections
const countConnect = () => {
    const numberOfConnections = mongoose.connections.length;
    console.log(`Number of connections: ${numberOfConnections}`);
};

// Check for overload conditions
const checkOverload = () => {
    setInterval(() => {
        const numberOfConnections = mongoose.connections.length;
        const numberOfCores = os.cpus().length;
        const memoryUsageMb = process.memoryUsage().rss / 1024 / 1024;

        const maxConnections = numberOfCores * MAX_CONNECTIONS_PER_CORE;

        console.log(`Active connections: ${numberOfConnections}`);
        console.log(`Memory usage: ${memoryUsageMb.toFixed(2)} MB`);

        if (numberOfConnections > maxConnections) {
            console.log(`Connection overload detected`);
            // Add additional action/alert here if needed
        }
    }, INTERVAL_SECONDS);
};

module.exports = {
    countConnect,
    checkOverload,
};
