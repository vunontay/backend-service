"use strict";

const developmentEnvironment = {
    app: {
        port: process.env.DEV_APP_PORT,
    },
    db: {
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        name: process.env.DEV_DB_NAME,
    },
};

const productionEnvironment = {
    app: {
        port: process.env.PROD_APP_PORT || 3000,
    },
    db: {
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        name: process.env.PROD_DB_NAME,
    },
};

const config = {
    development: developmentEnvironment,
    production: productionEnvironment,
};

const env = process.env.NODE_ENV || "development";

module.exports = config[env];
