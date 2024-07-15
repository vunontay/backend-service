"use strict";

const { Created, SuccessResponse } = require("../core/success-response");
const AccessService = require("../services/access-service");

class AccessController {
    refreshToken = async (req, res) => {
        const metadata = await AccessService.refreshToken(
            req.body.refreshToken
        );
        SuccessResponse.create("Get token successfully!", 200, metadata).send(
            res
        );
    };

    logout = async (req, res) => {
        const metadata = await AccessService.logout(req.keyStore);
        SuccessResponse.create("Logout successfully!", 200, metadata).send(res);
    };

    login = async (req, res) => {
        const metadata = await AccessService.login(req.body);
        SuccessResponse.create("Login successfully!", 200, metadata).send(res);
    };

    register = async (req, res, next) => {
        const metadata = await AccessService.register(req.body);
        Created.create("Register successfully!", metadata).send(res);
    };
}

module.exports = new AccessController();
