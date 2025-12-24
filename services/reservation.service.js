const { Reservation } = require('../models')
const validateReservationData = require('../validation/reservation');


const getReservations = async () => {

  const checkinArray = []

  const reservationsArray = await Reservation.find()

  console.log("reservationsArray: ", reservationsArray);

  for (let i = 0; i < reservationsArray.length; i++) {
    checkinArray.push(reservationsArray[i].checkin)
    let nights = reservationsArray[i].nights

    for (let j = 1; j < nights; j++) {
      let date = new Date(reservationsArray[i].checkin)
      date = new Date(date.setDate(date.getDate() + j))
      date = date.toLocaleString('hu-HU').substr(0, 13)
      checkinArray.push(date)
    }
  }

  console.log("checkinArray: ", checkinArray);
  return checkinArray

}

const getReservationsToUser = async () => {

  const checkinArray = []
  const checkoutArray = []

  const reservationsArray = await Reservation.find()

  for (let i = 0; i < reservationsArray.length; i++) {
    checkinArray.push(reservationsArray[i].checkin)
    let nights = reservationsArray[i].nights

    for (let j = 1; j < nights; j++) {
      let date = new Date(reservationsArray[i].checkin)
      date = new Date(date.setDate(date.getDate() + j))
      date = date.toLocaleString('hu-HU').substr(0, 13)
      // console.log(checkinArray);
      checkinArray.push(date)
    }
  }

  for (let i = 0; i < reservationsArray.length; i++) {
    let nights = reservationsArray[i].nights

    for (let j = 1; j <= nights; j++) {
      let date = new Date(reservationsArray[i].checkin)
      date = new Date(date.setDate(date.getDate() + j))
      date = date.toLocaleString('hu-HU').substr(0, 13)
      checkoutArray.push(date)
    }
  }

  const sortedCheckinArray = checkinArray.sort()
  const sortedCheckoutArray = checkoutArray.sort()

  return { sortedCheckinArray, sortedCheckoutArray }

}

const getReservationsToAdmin = async (googleId) => {

  const checkinArray = []
  const checkoutArray = []
  const adminArray = []

  const userReservationsArray = await Reservation.find({ googleId: { $ne: googleId } })
  const adminReservationsArray = await Reservation.find({ googleId: googleId })

  for (let i = 0; i < userReservationsArray.length; i++) {

    checkinArray.push(userReservationsArray[i].checkin)
    let nights = userReservationsArray[i].nights

    for (let j = 1; j < nights; j++) {
      let date = new Date(userReservationsArray[i].checkin)
      date = new Date(date.setDate(date.getDate() + j))
      date = date.toLocaleString('hu-HU').substr(0, 13)
      checkinArray.push(date)
    }
  }

  for (let i = 0; i < userReservationsArray.length; i++) {
    let nights = userReservationsArray[i].nights

    for (let j = 1; j <= nights; j++) {
      let date = new Date(userReservationsArray[i].checkin)
      date = new Date(date.setDate(date.getDate() + j))
      date = date.toLocaleString('hu-HU').substr(0, 13)
      checkoutArray.push(date)
    }
  }

  for (let i = 0; i < adminReservationsArray.length; i++) {

    if (adminReservationsArray[i].calendar_eventId) {

      checkinArray.push(adminReservationsArray[i].checkin)
      let nights = adminReservationsArray[i].nights

      for (let j = 1; j < nights; j++) {
        let date = new Date(adminReservationsArray[i].checkin)
        date = new Date(date.setDate(date.getDate() + j))
        date = date.toLocaleString('hu-HU').substr(0, 13)
        checkinArray.push(date)
      }

    } else {

      adminArray.push(adminReservationsArray[i].checkin)
      let nights = adminReservationsArray[i].nights

      for (let j = 1; j < nights; j++) {
        let date = new Date(adminReservationsArray[i].checkin)
        date = new Date(date.setDate(date.getDate() + j))
        date = date.toLocaleString('hu-HU').substr(0, 13)
        adminArray.push(date)
      }

    }

  }

  const sortedCheckinArray = checkinArray.sort()
  const sortedCheckoutArray = checkoutArray.sort()
  const sortedAdminArray = adminArray.sort()

  return { sortedCheckinArray, sortedCheckoutArray, sortedAdminArray }

}

const userReservation = async (req) => {

  const { checkin, checkout, persons, firstname, lastname, email, phone, googleId } = req.body

  const nights = (new Date(checkin) - new Date(checkout)) / 24 / 60 / 60 / 1000 * (-1)

  const newReservation = new Reservation({
    checkin,
    checkout,
    nights,
    persons,
    first_name: firstname,
    last_name: lastname,
    email,
    phone,
    googleId
  })

  const savedReservation = await newReservation.save()

  return savedReservation

}

const updateReservationWithEventId = async (reservationId, eventId) => {

  const updatedEvent = await Reservation.updateOne(
    { _id: reservationId },
    { $set: { 'calendar_eventId': eventId } }
  )

  return updatedEvent

}

const adminReservation = async (adminReservations) => {

  const newReservations = await Reservation.insertMany(adminReservations)
  return newReservations

}

const adminCurrentReservations = async (googleId) => {

  const currentUsersReservationsArray = await Reservation.find({ googleId: { $ne: googleId } })
  const adminReservationsArray = await Reservation.find({ googleId: googleId })

  const filteredCurrentUsersReservations = currentUsersReservationsArray.filter(reservation => new Date(reservation.checkin) >= new Date())
  const sortedCurrentUserReservations = filteredCurrentUsersReservations.sort((a, b) => (a.checkin > b.checkin) ? 1 : ((b.checkin > a.checkin) ? -1 : 0))
  const sortedAdminReservations = adminReservationsArray.sort((a, b) => (a.checkin > b.checkin) ? 1 : ((b.checkin > a.checkin) ? -1 : 0))

  return { sortedAdminReservations, sortedCurrentUserReservations }

}

const userCurrentReservations = async (googleId) => {

  console.log("googleId: ", googleId);

  const reservationsArray = await Reservation.find({ googleId: googleId })
  const filteredReservations = reservationsArray.filter(reservation => new Date(reservation.checkin) >= new Date())
  const sortedReservations = filteredReservations.sort((a, b) => (a.checkin > b.checkin) ? 1 : ((b.checkin > a.checkin) ? -1 : 0))

  return sortedReservations

}

const deleteReservations = async (id) => {

  const deletedReservation = await Reservation.findByIdAndDelete(id)
  return deletedReservation

}

const reservationValidation = async (data) => {

  const { errors, isValid } = validateReservationData(data);

  if (!isValid) return errors
  else return false


}

module.exports = {
  getReservations,
  getReservationsToUser,
  getReservationsToAdmin,
  userReservation,
  updateReservationWithEventId,
  adminReservation,
  adminCurrentReservations,
  userCurrentReservations,
  deleteReservations,
  reservationValidation
}