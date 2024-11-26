import express from 'express'
import { adminConroller } from '../controllers/index.js'
import { checkAdmin } from '../utils/index.js'

export const router = express.Router()

router.get('/all-users', checkAdmin, adminConroller.getAllUsers)
router.get('/all-tasks', checkAdmin, adminConroller.getAllTasks)
