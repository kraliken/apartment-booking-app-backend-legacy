require('dotenv').config()
const app = require('./app')
const connection = require('./db')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`My app listening at http://localhost:${PORT}`))