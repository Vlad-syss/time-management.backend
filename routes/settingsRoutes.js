import express from 'express'
import { settingsController } from '../controllers/index.js'
import { checkAuth } from '../utils/index.js'

export const router = express.Router()

router.get('/', checkAuth, settingsController.getSettings)
router.put('/', checkAuth, settingsController.updateSettings)
