import express from 'express'
const router = express.Router()

import { adminLogin } from '../controller/adminController.js'

router.post('/login', adminLogin)

export default router
