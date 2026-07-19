const express = require('express')
const cookieParser = require('cookie-parser')
const authRoute = require('./routes/auth.routes')
const musicRoute = require('./routes/music.routes')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use('/api/auth', authRoute)
app.use('/api/music', musicRoute)


module.exports = app