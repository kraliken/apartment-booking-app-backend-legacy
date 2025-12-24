const loginService = require("../services/login.service")
const jwt = require('jsonwebtoken')

const getGoogleAuthUrl = async (req, res) => {

  const googleAuthUrl = await loginService.googleAuthUrl()

  // console.log(googleAuthUrl);

  res.send({ authURL: googleAuthUrl })

}

const getGoogleUserData = async (req, res) => {

  if (!req.body || !req.body.code) return res.status(400).send({ msg: "Code missing" })

  // console.log("controller - getGoogleUserData");
  // console.log(req.body.code);

  console.log("1) code received");
  const userData = await loginService.exchangeForIdToken(req.body.code)
  console.log("2) exchanged token ok?", !!userData);

  if (!userData) return res.sendStatus(400)

  const user = await loginService.checkUser(userData)

  if (!user) return res.status(401).send({ msg: "Email not verified" })

  const payload = { first_name: user.first_name, last_name: user.last_name, email: user.email, picture: user.picture, googleId: user.googleId, admin: user.isAdmin }
  const secretOrPrivatkey = process.env.SECRET_OR_PRIVATEKEY;

  jwt.sign(
    payload,
    secretOrPrivatkey,
    { expiresIn: "1h" },
    (err, token) => {

      if (err) return res.sendStatus(500)
      else res.send({ success: true, token: `Bearer ${token}` })

    }
  )

}

module.exports = {
  getGoogleAuthUrl,
  getGoogleUserData
}