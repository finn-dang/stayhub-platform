const express = require("express");
const router = express.Router();
const LoginController = require("../../controllers/user/login.controller");
router.get("/", LoginController.index);
router.get("/auth/google", LoginController.googleauth);
router.post("/", LoginController.checkEmail, LoginController.login);
module.exports = router;
