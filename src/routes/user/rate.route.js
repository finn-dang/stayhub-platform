const express = require("express");
const router = express.Router();
const RatingController = require("../../controllers/user/rating.controller");
router.post("/", RatingController.addComment);
module.exports = router;
