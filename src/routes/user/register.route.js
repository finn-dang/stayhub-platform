const express = require("express");
const router = express.Router();
const ResisterRouter = require("../../controllers/user/register.controller");


router.get("/", ResisterRouter.index);
router.post("/", ResisterRouter.checkEmailExist, ResisterRouter.load);
module.exports = router;