const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller")
const authenticate = require('../middleware/authenticate')


router.get("/public", reservationController.getAllReservations)
router.get("/user", authenticate, reservationController.getAllReservationsForUser)
router.post("/user", authenticate, reservationController.apartmentUserReservation)
router.get("/admin", authenticate, reservationController.getAllReservationsForAdmin)
router.post("/admin", authenticate, reservationController.apartmentAdminReservation)
router.get("/current/user", authenticate, reservationController.getCurrentReservations)
router.get("/current/admin", authenticate, reservationController.getCurrentReservations)
router.delete("/:id", authenticate, reservationController.deleteReservation)

module.exports = router;