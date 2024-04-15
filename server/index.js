import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import videoRoutes from './routes/videoRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import SearchRoutes from './routes/SearchRoutes.js'
import subscribeRoutes from './routes/subscribeRoutes.js'
import likeRoutes from './routes/likeRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()
dotenv.config()

//middlewares
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())
app.use(cookieParser())
app.use('/users', userRoutes)
app.use('/videos', videoRoutes)
app.use('/comment', commentRoutes)
app.use('/search', SearchRoutes)
app.use('/subscribe', subscribeRoutes)
app.use('/like', likeRoutes)
app.use('/admin', adminRoutes)

const CONNECTION_URL =
  'mongodb+srv://ngothuan2422001:Ngovanthuan2001@youpixels.hpkrfpg.mongodb.net/you-pixels?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5002

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`),
    ),
  )
  .catch((error) => console.log(`${error} did not connect`))
