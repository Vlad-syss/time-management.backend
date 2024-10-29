import express from 'express'
import { reminderController } from '../controllers/index.js'
import { checkAuth } from '../utils/index.js'

export const router = express.Router()

router.post('/', checkAuth, reminderController.createReminder)
router.get('/', checkAuth, reminderController.getAllReminders)
router.get('/:id', checkAuth, reminderController.getReminderbyId)
router.put('/:id', checkAuth, reminderController.updateReminder)
router.delete('/:id', checkAuth, reminderController.deleteReminder)
