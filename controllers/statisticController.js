import { statisticModel, taskModel } from '../models/index.js'

export const getUserStatistics = async (req, res) => {
	try {
		const userId = req.userId
		const statistics = await statisticModel.findOne({ userId })

		if (!statistics) {
			return res.status(404).json({ message: 'Statistics not found!' })
		}

		res.json(statistics)
	} catch (error) {
		console.error('Failed to get statistics:', error)
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
		const rescheduledTasks = userTasks.filter(
			task => task.status && task.status.rescheduled
		).length

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

		const longestTaskTime = allCompletedTasks.reduce((max, task) => {
			const time = new Date(task.endTime) - new Date(task.startTime)
			return time > max ? time : max
		}, 0)

		const categories = userTasks.reduce((acc, task) => {
			if (!acc[task.category.name]) {
				acc[task.category.name] = { count: 0, totalTime: 0 }
			}
			acc[task.category.name].count += 1
			acc[task.category.name].totalTime +=
				new Date(task.endTime) - new Date(task.startTime)
			return acc
		}, {})

		const formattedCategories = Object.entries(categories).map(
			([name, data]) => ({
				name,
				taskCount: data.count,
				averageTime: data.totalTime / data.count || 0,
			})
		)

		const dailyPerformance = userTasks.reduce((acc, task) => {
			const day = new Date(task.endTime).toLocaleDateString('en-US', {
				weekday: 'long',
			})
			acc[day] = (acc[day] || 0) + 1
			return acc
		}, {})

		const monthlyPerformance = userTasks.reduce((acc, task) => {
			const month = new Date(task.endTime).toLocaleDateString('en-US', {
				month: 'long',
				year: 'numeric',
			})
			acc[month] = (acc[month] || 0) + 1
			return acc
		}, {})

		const bestDay = Object.keys(dailyPerformance).reduce((best, day) => {
			return dailyPerformance[day] > (dailyPerformance[best] || 0) ? day : best
		}, null)

		let statistics = await statisticModel.findOneAndUpdate(
			{ userId },
			{
				allCompleted,
				allArchived,
				completedOnTime,
				completedLate: completedLateTasks,
				averageTime,
				categories: formattedCategories,
				dailyPerformance,
				monthlyPerformance,
				bestDay,
				rescheduledTasks,
				longestTaskTime,
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
			monthlyPerformance: {},
			bestDay: null,
			rescheduledTasks: 0,
			longestTaskTime: 0,
		})

		await newStatistics.save()
		return newStatistics
	} catch (error) {
		console.error('Failed to initialize statistics:', error)
		throw error
	}
}
