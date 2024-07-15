"use strict";

const {
    Types: { ObjectId },
} = require("mongoose");
const keyTokenModel = require("../models/key-token-model");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken,
                },
                options = { upsert: true, new: true };

            const tokens = await keyTokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            console.error("Error in createKeyToken:", error);
            throw error;
        }
    };

    static findByUserId = async (userId) => {
        return await keyTokenModel
            .findOne({ user: new ObjectId(userId) })
            .lean();
    };
    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: new ObjectId(id) });
    };

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel
            .findOne({ refreshTokensUsed: refreshToken })
            .lean();
    };

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken });
    };

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.deleteOne({
            user: new ObjectId(userId),
        });
    };
}

module.exports = KeyTokenService;
