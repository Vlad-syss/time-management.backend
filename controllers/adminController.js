import { taskModel, userModel } from '../models/index.js'

export const getAllUsers = async (req, res) => {
	try {
		const users = await userModel.find().select('-passwordHash')
		res.json(users)
	} catch (error) {
		res.status(500).json({
			message: 'Unable to retrieve users!',
		})
	}
}

export const getAllTasks = async (req, res) => {
	try {
		const tasks = await taskModel.find()

		const totalTasks = tasks.length
		const completedTasks = tasks.filter(
			task => task.status && task.status.completed
		).length
		const pendingTasks = totalTasks - completedTasks

		res.json({
			success: true,
			data: {
				stats: {
					totalTasks,
					completedTasks,
					pendingTasks,
				},
				tasks,
			},
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Unable to retrieve tasks!',
			error: error.message,
		})
	}
}
