const { google } = require('googleapis')
const accessTokenService = require("../services/access.token.service")

const CLIENT_ID = process.env.LOGIN_CLIENT_ID
const CLIENT_SECRET = process.env.LOGIN_CLIENT_SECRET
const CALENDAR_REFRESH_TOKEN = process.env.CALENDAR_REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground")

const createEvent = async (data, user, nights) => {

  const { checkin, checkout, persons, firstname, lastname, email, phone, googleId } = data

  const accessToken = await accessTokenService.getAccesToken(CALENDAR_REFRESH_TOKEN)

  oAuth2Client.setCredentials({ access_token: accessToken })
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

  const startDate = `${new Date(checkin).toLocaleString('hu-HU').substr(0, 12).replace(". ", "-").replace(". ", "-")}T14:00:00+02:00`
  const endDate = `${new Date(checkout).toLocaleString('hu-HU').substr(0, 12).replace(". ", "-").replace(". ", "-")}T10:00:00+02:00`

  const newEvent = {
    summary: `${lastname} ${firstname}`,
    description: `
    email: ${email}
    telefon: ${phone}
    éjszakák: ${nights}
    fő: ${persons}
    foglalta: ${user.email}`,
    start: {
      dateTime: startDate,
    },
    end: {
      dateTime: endDate,
    }
  }

  try {

    const newCalendarEvent = await calendar.events.insert({
      auth: oAuth2Client,
      sendUpdates: "all",
      calendarId: "primary",
      resource: newEvent,
    })

    return newCalendarEvent.data.id

  } catch (error) {
    console.log("Calendar create event error: " + error)
  }

}

const deleteEvent = async (eventId) => {

  const accessToken = await accessTokenService.getAccesToken(CALENDAR_REFRESH_TOKEN)

  oAuth2Client.setCredentials({ refresh_token: accessToken })
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

  const deletedEvent = await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  })

  return deletedEvent

}

module.exports = {
  createEvent,
  deleteEvent
}