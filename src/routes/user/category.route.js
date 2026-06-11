const express = require("express");
const router = express.Router();  // Fixed
const TypeController = require("../../controllers/user/category.controller");
const cloudinary = require("../../config/cloudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const multer = require("multer");
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'type',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
});
var upload = multer({ storage: storage }).single("singleImg")

router.get("/", TypeController.index);
router.post("/", upload, TypeController.add);

module.exports = router;