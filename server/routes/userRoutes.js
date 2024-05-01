import express from 'express'
const router = express.Router()

import {
  activeUser,
  deleteUser,
  getAllUsers,
  getUser,
  googleAuth,
  sub,
  unsub,
  updateUser,
} from '../controller/userController.js'
import auth from '../middleware/auth.js'

router.post('/google', googleAuth)

router.patch('/sub/:channelId', auth, sub)
router.patch('/unsub/:channelId', auth, unsub)
router.patch('/active/:userId', auth, activeUser)
router.patch('/:userId', auth, updateUser)

router.delete('/:userId', auth, deleteUser)

router.get('/:userId', getUser)
router.get('/', auth, getAllUsers)

export default router
