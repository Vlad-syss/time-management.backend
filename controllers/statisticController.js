import { statisticModel, taskModel } from '../models/index.js'

export const getUserStatistics = async (req, res) => {
	try {
		const userId = req.userId
		const statistics = await statisticModel
			.findOne({ userId })
			.populate('categories.category')

		if (!statistics) {
			return res.status(404).json({ message: 'Statistics not found!' })
		}

		res.json(statistics)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Failed to get statistics!' })
	}
}

export const updateUserStatistics = async userId => {
	try {
		const userTasks = await taskModel.find({ userId })
		const allCompletedTasks = userTasks.filter(
			task => task.status && task.status.completed
		)
		const allArchived = userTasks.filter(
			task => task.status && task.status.archived
		).length

		const allCompleted = allCompletedTasks.length

		const completedOnTimeTasks = allCompletedTasks.filter(
			task => new Date(task.endTime) >= new Date(task.startTime)
		)
		const completedOnTime = completedOnTimeTasks.length

		const completedLateTasks = allCompletedTasks.filter(
			task => !completedOnTimeTasks.includes(task)
		).length

		const totalTime = allCompletedTasks.reduce((total, task) => {
			return total + (new Date(task.endTime) - new Date(task.startTime))
		}, 0)
		const averageTime = allCompleted ? totalTime / allCompleted : 0

		const allCategories = userTasks.map(task => task.category.name)

		let statistics = await statisticModel.findOneAndUpdate(
			{ userId: userId },
			{
				allCompleted: allCompleted,
				completedOnTime: completedOnTime,
				allArchived: allArchived,
				completedLate: completedLateTasks,
				averageTime: averageTime,
				categories: allCategories,
				dailyPerformance: [],
			},
			{ new: true, upsert: true }
		)

		await statistics.save()

		return statistics
	} catch (error) {
		console.error('Failed to update statistics:', error)
		throw error
	}
}

export const initializeStatistics = async userId => {
	try {
		const existingStatistics = await statisticModel.findOne({ userId })

		if (existingStatistics) {
			return existingStatistics
		}

		const newStatistics = new statisticModel({
			userId,
			allCompleted: 0,
			averageTime: 0,
			allArchived: 0,
			completedOnTime: 0,
			completedLate: 0,
			categories: [],
			dailyPerformance: {},
		})

		await newStatistics.save()
		return newStatistics
	} catch (error) {
		console.error('Failed to initialize statistics:', error)
		throw error
	}
}
