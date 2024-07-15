require("dotenv").config();
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();

// INIT MIDDLEWARE
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
// INIT DB
require("./db/init-mongoose");
// const { checkOverload } = require("./helpers/check-connect");
// checkOverload();
// INIT ROUTING
app.use("/", require("./routes"));
// HANDLER ERROR MESSAGE

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: error.message || "Internal Server Error",
    });
});
module.exports = app;
