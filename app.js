require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const multer = require('multer')
const utils = require('./utils/utils')
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/uploadRoutes')

const app = express()

// const upload = multer({ dest: 'uploads' })

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/auth', authRoutes)
app.use('/storage', uploadRoutes)

app.use((error, req, res, next) => {
  console.log('LAST ERROR MOD')
  console.log(error)
  const statusCode = error.statusCode || utils.codes.serverError
  res.status(statusCode).json({
    message: error.message,
    data: error.data
  })
});

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://sailor:${process.env.PASSWORD}@sm-cluster.yldyivh.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
    )
    console.log(`Connected to MongoDB @ ${process.env.DATABASE_NAME}`)
    app.listen(process.env.PORT)
  } catch (err) {
    console.log(err)
  }
})()
