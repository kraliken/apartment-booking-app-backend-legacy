const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    checkin: {
      type: String,
    },
    checkout: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    nights: {
      type: String,
    },
    persons: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    googleId: {
      type: String,
    },
    calendar_eventId: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = Reservation = mongoose.model('Reservation', ReservationSchema);
