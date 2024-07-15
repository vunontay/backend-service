"use strict";

const express = require("express");
const accessController = require("../../controllers/access-controller");
const asyncHandler = require("../../helpers/async-handler");
const { authentication } = require("../../auth/auth-util");

const router = express.Router();

// Register
router.post("/shop/register", asyncHandler(accessController.register));
// Login
router.post("/shop/login", asyncHandler(accessController.login));
// Authentication
router.use(authentication);
router.post("/shop/logout", asyncHandler(accessController.logout));
// RefreshToken
router.post("/shop/refresh-token", asyncHandler(accessController.refreshToken));

module.exports = router;
