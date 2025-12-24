const { User } = require('../models')
const { google } = require('googleapis')
const fetch = require('node-fetch')
const axios = require("axios");
// const jwt = require('jsonwebtoken')
const jwt_decode = require('jwt-decode')

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid"
]

const CLIENT_ID = process.env.LOGIN_CLIENT_ID
const CLIENT_SECRET = process.env.LOGIN_CLIENT_SECRET
const REDIRECT_URI = process.env.LOGIN_REDIRECT_URI
const GRANT_TYPE = process.env.LOGIN_GRANT_TYPE

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)


const googleAuthUrl = async () => {

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: "select_account",
    redirect_uri: REDIRECT_URI
  });

  return url

}

const exchangeForIdToken = async (code) => {


  const fetchBody = {
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: GRANT_TYPE
  }

  try {

    // const response = await fetch("https://oauth2.googleapis.com/token", {
    //   method: 'POST', 
    //   headers: {
    //       'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(fetchBody)
    // })

    const response = await axios.post('https://oauth2.googleapis.com/token', fetchBody)

    // const userData = await response.json()
    const userData = response.data

    return userData

  } catch (error) {

    console.log("google login error: " + error)

    return false

  }

}

const checkUser = async (userData) => {

  // const decoded = jwt_decode(userData.id_token);
  const decoded = jwt_decode("Bearer " + userData.id_token);

  console.log("decoded: ", decoded);

  const { email, given_name, family_name, picture, sub, email_verified } = decoded

  if (!email_verified) return false

  const user = await User.findOne({ googleId: sub })

  if (!user) {

    const newUser = new User({
      first_name: given_name,
      last_name: family_name,
      email,
      picture,
      googleId: sub
    })

    const savedUser = await newUser.save()

    return savedUser

  } else {

    return user

  }

}

module.exports = {
  googleAuthUrl,
  exchangeForIdToken,
  checkUser
}
