import express from 'express'
import { statisticController } from '../controllers/index.js'
import { checkAuth } from '../utils/index.js'

export const router = express.Router()

router.get('/', checkAuth, statisticController.getUserStatistics)
// router.put('/:id', checkAuth, statisticController.updateUserStatistics)
