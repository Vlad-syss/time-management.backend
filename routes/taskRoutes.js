import express from 'express'
import { taskController } from '../controllers/index.js'
import { checkAuth } from '../utils/index.js'

export const router = express.Router()

router.post('/', checkAuth, taskController.createTask)
router.get('/', checkAuth, taskController.getAllTasks)
router.put('/:id', checkAuth, taskController.updateTask)
router.get('/archived', checkAuth, taskController.getArchivedTasks)
router.get('/search', checkAuth, taskController.searchTasks) // Специфіка !!!!!
router.get('/:id', checkAuth, taskController.getTaskById) // Динаміка єбать
router.post('/:id/archive', checkAuth, taskController.toggleArchive)
router.post('/:id/complete', checkAuth, taskController.toggleComplete)
router.delete('/:id', checkAuth, taskController.deleteTask)
