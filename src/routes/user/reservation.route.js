const express = require("express");
const router = express.Router();
const ReservationController = require("../../controllers/user/reservation.controller");

// Use 'router' instead of 'Route'
router.get("/:id", ReservationController.getUserReservation);
router.post("/payment", ReservationController.payment);
router.get("/payment/success", ReservationController.success);

module.exports = router;