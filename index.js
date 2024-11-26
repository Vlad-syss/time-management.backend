import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import cron from 'node-cron'
import { upload } from './config/multerConfig.js'
import { archiveExpiredTasks } from './controllers/taskController.js'
import {
	adminRoutes,
	reminderRoutes,
	settingsRoutes,
	statisticRoutes,
	taskRoutes,
	userRoutes,
} from './routes/index.js'
import { checkAuth, connectDB } from './utils/index.js'

dotenv.config()
const app = express()

app.use(express.json())
app.use(
	cors({
		origin: process.env.BASE_URL,
		credentials: true,
	})
)
app.use(connectDB())

cron.schedule('*/1 * * * *', async function () {
	try {
		await archiveExpiredTasks()
	} catch (error) {
		console.log(error)
	}
})

app.use('/uploads', express.static('uploads'))
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/statistic', statisticRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/admin', adminRoutes)

app.post(
	'api/upload/avatar',
	checkAuth,
	upload.single('avatar'),
	(req, res) => {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' })
		}

		res.json({
			url: `/uploads/${req.file.originalname}`,
		})
	}
)

const PORT = process.env.PORT || 4444

app.listen(PORT, err => {
	if (err) {
		return console.log(err)
	}

	console.log('Server OK')
})
