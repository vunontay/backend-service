"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/async-handler");
const {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} = require("../core/error-response");
const { findByUserId } = require("../services/key-token-service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        JWT.verify(accessToken, publicKey, (error, decode) => {
            if (error) {
                console.log(`Error verifying: ${error}`);
            } else {
                console.log(`Decoded token: ${JSON.stringify(decode)}`);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(`Error creating token pair: ${error.message}`);
        throw error;
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /* 
        1- Check userId missing?
        2- get access token
        3- verify  token
        4- check user in database
        5- check keyStore with userId
        6- Ok all => next()
    */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new ForbiddenError("Invalid Request!");

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore!");

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new ForbiddenError("Invalid Request!");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId)
            throw new UnauthorizedError("Invalid userId!");
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret);
};

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
};
