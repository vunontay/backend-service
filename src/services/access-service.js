"use strict";

const shopModel = require("../models/shop-model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./key-token-service");
const { createTokenPair, verifyJWT } = require("../auth/auth-util");
const { getInfoData } = require("../utils");
const {
    BadRequestError,
    InternalServerError,
    ForbiddenError,
    UnauthorizedError,
} = require("../core/error-response");
const { findByEmail } = require("./shop-service");

const RoleShop = {
    SHOP: "001",
    WRITER: "002",
    EDITOR: "003",
    ADMIN: "004",
};

class AccessService {
    static refreshToken = async (refreshToken) => {
        // Check token used ?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );
        // If used
        if (foundToken) {
            // Decode token who ?
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );
            console.log({ userId, email });
            // Delete all token in keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError(
                "Something wrong happen ! Please re login"
            );
        }
        // If not use token
        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new UnauthorizedError("Shop not registered!");
        // Verify token
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );
        console.log({ userId, email });
        // Check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new UnauthorizedError("Shop not registered!");

        // create new token
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        // Update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            },
        });
        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const deleteKey = await KeyTokenService.removeKeyById(keyStore._id);
        return deleteKey;
    };

    /* 
    1 check email address in database
    2 match password
    3 create accessToken vs refreshToken and save
    4 generate tokens
    5 get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Shop not found!");

        const match = await bcrypt.compare(password, foundShop.password);
        if (!match) throw new ForbiddenError("Authentication error!");

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId,
        });
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

    static register = async ({ name, email, password }) => {
        // Kiểm tra xem shop đã tồn tại chưa
        const shop = await shopModel.findOne({ email }).lean();
        if (shop) {
            throw new BadRequestError("Shop already registered!");
        }

        // Mã hóa mật khẩu
        const passwordHash = await bcrypt.hash(password, 10);

        // Tạo shop mới
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (!newShop) {
            throw new InternalServerError("Failed to create new shop");
        }

        // Tạo private key và public key
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        // Tạo key token
        const keyStore = await KeyTokenService.createKeyToken({
            userId: newShop._id,
            publicKey,
            privateKey,
        });

        if (!keyStore) {
            throw new InternalServerError("Failed to create key token");
        }

        // Tạo token pair
        const tokens = await createTokenPair(
            {
                userId: newShop._id,
                email,
            },
            publicKey,
            privateKey
        );

        return {
            code: 201,
            metadata: {
                shop: getInfoData({
                    fields: ["_id", "name", "email"],
                    object: newShop,
                }),
                tokens,
            },
        };
    };
}

module.exports = AccessService;
