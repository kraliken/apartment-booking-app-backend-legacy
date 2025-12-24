const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')

const jwt_decode = require('jwt-decode')
const jwt = require('jsonwebtoken')

const loginService = require('./services/login.service')

const swaggerUi = require('swagger-ui-express')
YAML = require('yamljs')
const SwaggerDocument = YAML.load('./docs.yaml')

const reservationRouter = require('./routes/reservation')
const loginRouter = require('./routes/login')
const errorHandler = require('./middleware/error.handler')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(SwaggerDocument))

// routes
app.use('/api/login', loginRouter)
app.use('/api/reservations', reservationRouter)

app.get("/", (req, res) => {
  res.send({ msg: "az app fut" })
})

app.get("/oauth2-redirect.html", async (req, res) => {

  let codeFromGoogle = req.query.code;

  const fetchBody = {
    code: codeFromGoogle,
    client_id: process.env.LOGIN_CLIENT_ID,
    client_secret: process.env.LOGIN_CLIENT_SECRET,
    redirect_uri: "http://localhost:5000/oauth2-redirect.html",
    grant_type: process.env.LOGIN_GRANT_TYPE
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fetchBody)
  })

  const userData = await response.json()

  const user = await loginService.checkUser(userData)

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
})

// errorhandler
app.use(errorHandler)

module.exports = app
