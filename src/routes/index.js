"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/auth-check");
const router = express.Router();

// Check api key
router.use(apiKey);

// Check permissions
router.use(permission("0000"));

router.use("/v1/api", require("./access"));

module.exports = router;
