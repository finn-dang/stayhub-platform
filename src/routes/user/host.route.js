const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/host.controller");
router.get("/hosting", userController.getHosting);
router.get("/hosting/calendar", userController.getHostingCalendar);
router.get("/calendar",userController.getHostingCalendar);
router.get("/calendar/:id",userController.getSpecificHostingCalendar);
module.exports = router;
