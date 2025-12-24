const { Reservation } = require('../models')
const reservationService = require("../services/reservation.service")
const emailService = require("../services/email.service")
const calendarService = require("../services/calendar.service")


const getAllReservations = async (req, res) => {

  const reservations = await reservationService.getReservations()
  res.send(reservations)

}

const getAllReservationsForUser = async (req, res) => {

  const { sortedCheckinArray, sortedCheckoutArray } = await reservationService.getReservationsToUser()
  res.status(200).send({ checkinArray: sortedCheckinArray, checkoutArray: sortedCheckoutArray })

}

const getAllReservationsForAdmin = async (req, res) => {

  const { sortedCheckinArray, sortedCheckoutArray, sortedAdminArray } = await reservationService.getReservationsToAdmin(res.locals.user.googleId)
  res.send({ checkinArray: sortedCheckinArray, checkoutArray: sortedCheckoutArray, adminArray: sortedAdminArray })

}

const apartmentUserReservation = async (req, res) => {

  const errors = await reservationService.reservationValidation(req.body)

  console.log("role: ", res.locals.user.admin);

  if (!errors && res.locals.user.admin) {
    console.log("admin");
    const savedReservation = await reservationService.userReservation(req)
    await emailService.sendEmail(savedReservation, res.locals.user)
    const eventId = await calendarService.createEvent(req.body, res.locals.user, savedReservation.nights)
    const updatedReservationWithEventId = await reservationService.updateReservationWithEventId(savedReservation._id, eventId)
    return res.send({ success: true, reservation: updatedReservationWithEventId })
    // return res.send({ success: true })
  } else if (!errors && !res.locals.user.admin) {
    console.log("user");
    const savedReservation = await reservationService.userReservation(req)
    const eventId = await calendarService.createEvent(req.body, res.locals.user, savedReservation.nights)
    const updatedReservationWithEventId = await reservationService.updateReservationWithEventId(savedReservation._id, eventId)
    return res.send({ success: true, reservation: savedReservation })
  } else {
    return res.status(404).send(errors)
  }

}

const apartmentAdminReservation = async (req, res) => {

  const savedReservation = await reservationService.adminReservation(req.body)
  res.send(savedReservation)

}

const getCurrentReservations = async (req, res) => {

  if (res.locals.user.admin) {
    const { sortedAdminReservations, sortedCurrentUserReservations } = await reservationService.adminCurrentReservations(res.locals.user.googleId)
    res.send({ adminReservations: sortedAdminReservations, userCurrentReservations: sortedCurrentUserReservations })
  } else if (!res.locals.user.admin) {
    const currentUserReservations = await reservationService.userCurrentReservations(res.locals.user.googleId)
    res.send({ userReservations: currentUserReservations })
  }

}

const deleteReservation = async (req, res) => {

  const deletedReservation = await reservationService.deleteReservations(req.params.id)

  if (deletedReservation.calendar_eventId) {
    await calendarService.deleteEvent(deletedReservation.calendar_eventId)
  }

  res.send({ msg: "success", deletedReservation })

}


module.exports = {
  getAllReservations,
  getAllReservationsForUser,
  getAllReservationsForAdmin,
  apartmentUserReservation,
  apartmentAdminReservation,
  getCurrentReservations,
  deleteReservation
}