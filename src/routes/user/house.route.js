const express = require("express");
const router = express.Router();  // Fixed
const HouseController = require("../../controllers/user/house.controller")
const cloudinary = require("../../config/cloudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'product',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
});
var upload = multer({ storage: storage }).array("productImg", 12);

router.get("/edit", HouseController.Index);
router.get("/edit/:id", HouseController.GerHouseDetails);
router.get("/title", HouseController.DisplayTitle);
router.post("/title", HouseController.SaveTitle);
router.get("/detail", HouseController.DisplayDetail);
router.post("/detail", HouseController.SaveDetail);
router.get("/photos", HouseController.DisplayPhotos);
router.post("/photos", upload, HouseController.SavePhotos);
router.get("/price", HouseController.DisplayPrice);
router.post("/price", HouseController.SaveNewRoom);
router.get("/:id", HouseController.specific);

module.exports = router;