import express from 'express'
const router = express.Router()

import {
  getAllUsers,
  getUser,
  googleAuth,
  sub,
  unsub,
} from '../controller/userController.js'
import auth from '../middleware/auth.js'

router.post('/google', googleAuth)

router.patch('/sub/:channelId', auth, sub)
router.patch('/unsub/:channelId', auth, unsub)

router.get('/:userId', getUser)
router.get('/', auth, getAllUsers)

export default router
