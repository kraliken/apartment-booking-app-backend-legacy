const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

const connection = mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useFindAndModify: false 
})
.then(() => console.log('MongoDB Atlas Connected'))
.catch(err => console.log(err))

module.exports = connection
