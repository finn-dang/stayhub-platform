const express = require("express");
const router = express.Router();

console.log('  Loading account routes...');
const accountRoutes = require("./account.route");
console.log('  ✅ Account routes loaded');

console.log('  Loading login routes...');
const loginRoutes = require("./login.route");
console.log('  ✅ Login routes loaded');

console.log('  Loading register routes...');
const registerRoutes = require("./register.route");
console.log('  ✅ Register routes loaded');

console.log('  Loading logout routes...');
const logoutRoutes = require("./logout.route");
console.log('  ✅ Logout routes loaded');

console.log('  Loading house routes...');
const houseRoutes = require("./house.route");
console.log('  ✅ House routes loaded');

console.log('  Loading host routes...');
const hostRoutes = require("./host.route");
console.log('  ✅ Host routes loaded');

console.log('  Loading reservation routes...');
const reservationRoutes = require("./reservation.route");
console.log('  ✅ Reservation routes loaded');

console.log('  Loading wishlist routes...');
const wishlistRoutes = require("./wishlist.route");
console.log('  ✅ Wishlist routes loaded');

console.log('  Loading rate routes...');
const rateRoutes = require("./rate.route");
console.log('  ✅ Rate routes loaded');

console.log('  Loading category routes...');
const categoryRoutes = require("./category.route");
console.log('  ✅ Category routes loaded');

const Home = require("../../controllers/user/index.controller");
const { isAuthenticated, isHost } = require("../../middleware/auth");

router.get("/", Home.defaultDisplay);
router.use("/login", loginRoutes);
router.use("/register", registerRoutes);
router.use("/logout", logoutRoutes);
router.use("/houses", houseRoutes);
router.use("/categories", categoryRoutes);
router.use("/account", isAuthenticated, accountRoutes);
router.use("/host", isHost, hostRoutes);
router.use("/reservation", isAuthenticated, reservationRoutes);
router.use("/wishlist", isAuthenticated, wishlistRoutes);
router.use("/rate", isAuthenticated, rateRoutes);

module.exports = router;