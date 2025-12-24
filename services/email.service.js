// require('dotenv').config()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const accessTokenService = require("../services/access.token.service")

const CLIENT_ID = process.env.LOGIN_CLIENT_ID
const CLIENT_SECRET = process.env.LOGIN_CLIENT_SECRET
// const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground")

const sendEmail = async (data, user) => {

  const { first_name, last_name, email } = user

  const accessToken = await accessTokenService.getAccesToken(process.env.EMAIL_REFRESH_TOKEN)

  try {
    console.log("in try");

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'norbert.kralik.dev@gmail.com',
        clientId: process.env.LOGIN_CLIENT_ID,
        clientSecret: process.env.LOGIN_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    })

    let emailAddress;
    let name;
    let reservation_name = "";

    if (email === data.email) {
      emailAddress = email;
      name = first_name
    } else if (email !== data.email) {
      emailAddress = [email, data.email]
      name = data.first_name
      reservation_name = `${first_name} ${last_name} `
    }

    const mailOptions = {
      from: 'norbert.kralik.dev@gmail.com',
      to: emailAddress,
      subject: 'foglalás megerősítés',
      text: `
        Kedves ${name},
        ${reservation_name}foglalását rögzítettük!
        Foglalásának részletei:
          vendég: ${data.first_name} ${data.last_name}
          érkezés: ${data.checkin}
          távozás: ${data.checkout}
          éjszakák száma: ${data.nights}
          vendégek száma: ${data.persons} fő
          elérhetőségek:
            telefon: ${data.phone}
            email: ${data.email}
        Várjuk szeretettel, blablabla!
        Panoráma Apartman Pilisszántó
      `,
      html: `
        <h3>Kedves ${name},</h3>
        <p>${reservation_name}foglalását rögzítettük!</p>
        <span>Foglalásának részletei:</span><br />
        <span>vendég: ${data.first_name} ${data.last_name}</span><br />
        <span>érkezés: ${data.checkin}</span><br />
        <span>távozás: ${data.checkout}</span><br />
        <span>éjszakák száma: ${data.nights}</span><br />
        <span>vendégek száma: ${data.persons} fő</span><br /><br />
        <span>elérhetőségek:</span><br />
        <span>telefon: ${data.phone}</span><br />
        <span>email: ${data.email}</span><br /><br />
        <span>Várjuk szeretettel, blablabla</span><br /><br />
        <span>Panoráma Apartman Pilisszántó</span><br />
      `
    }

    console.log("before transport.sendMail");

    await transport.sendMail(mailOptions)
    console.log("after transport.sendMail");

  } catch (error) {
    console.log("email error: " + error)
  }

}

module.exports = {
  sendEmail
}