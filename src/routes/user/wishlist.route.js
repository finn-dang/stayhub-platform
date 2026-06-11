const express = require("express");
const router = express.Router();
const WishlistController = require("../../controllers/user/wishlist.controller");

router.get("/", WishlistController.getWishlist);
router.post("/collection", WishlistController.addCollection);
router.post("/update/:id", WishlistController.updateWishlist);
module.exports = router;
