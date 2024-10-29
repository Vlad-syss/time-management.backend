import { taskModel, trashModel } from '../models/index.js'
import {
	Category,
	defaultCategory,
	defaultStatus,
} from '../models/taskModel.js'
import { updateUserStatistics } from './statisticController.js'

export const createTask = async (req, res) => {
	try {
		const { title, description, startTime, endTime, category, status } =
			req.body

		const categoryObj = category || (await defaultCategory())
		const statusObj = status || (await defaultStatus())

		const defCategory = new Category({
			name: categoryObj.name,
		})

		const task = new taskModel({
			title,
			description,
			userId: req.userId,
			startTime,
			endTime,
			category: defCategory,
			status: statusObj,
		})

		const savedTask = await task.save()

		await updateUserStatistics(req.userId)

		res.status(201).json(savedTask)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to create task!' })
	}
}

export const updateTask = async (req, res) => {
	try {
		const taskId = req.params.id
		const { title, description, startTime, endTime, category, status } =
			req.body

		const update = {}
		if (title !== undefined) update.title = title
		if (description !== undefined) update.description = description
		if (startTime !== undefined) update.startTime = startTime
		if (endTime !== undefined) update.endTime = endTime
		if (category !== undefined) update.category = category
		if (status !== undefined) update.status = status

		const updatedTask = await taskModel
			.findByIdAndUpdate(taskId, update, { new: true })
			.populate('category')
			.populate('status')

		if (!updatedTask) {
			return res.status(404).json({ message: 'Task not found!' })
		}
		await unarchiveExpiredTasks(taskId)
		await updateUserStatistics(req.userId)

		res.json({ updatedTask, success: true })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to update task!' })
	}
}

export const getAllTasks = async (req, res) => {
	try {
		const tasks = await taskModel.find().populate('category status')
		res.json(tasks)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to get tasks!' })
	}
}

export const getTaskById = async (req, res) => {
	try {
		const taskId = req.params.id
		const task = await taskModel.findById(taskId).populate('category status')

		if (!task) {
			return res.status(404).json({ message: 'Task not found!' })
		}

		res.json(task)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to get task!' })
	}
}

export const toggleArchive = async (req, res) => {
	try {
		const taskId = req.params.id
		const task = await taskModel.findById(taskId).populate('status')

		if (!task) {
			return res.status(404).json({ message: 'Task not found!' })
		}

		if (task.status.completed) {
			return res.status(400).json({ message: 'Task is completed!' })
		}

		const wasArchived = task.status.archived
		task.status.archived = !task.status.archived

		if (!task.status.archived) {
			task.startTime = task.startTime || new Date()
			task.endTime =
				task.endTime ||
				new Date(new Date().setHours(new Date().getHours() + 24))
		}

		await task.save()

		let archiveMessage
		if (task.status.archived) {
			const trash = new trashModel({
				task: task._id,
				archivedAt: new Date(),
			})
			await trash.save()
			archiveMessage = 'Task archived successfully!'
		} else {
			await trashModel.findOneAndDelete({ task: task._id })
			archiveMessage = 'Task unarchived successfully!'
		}

		await updateUserStatistics(req.userId)

		res.json({ message: archiveMessage })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to toggle task archive status!' })
	}
}

export const toggleComplete = async (req, res) => {
	try {
		const taskId = req.params.id
		const task = await taskModel.findById(taskId)

		if (!task) {
			return res.status(404).json({ message: 'Task not found!' })
		}

		if (task.status.archived) {
			return res.status(400).json({ message: 'Task is archived!' })
		}

		task.status.completed = !task.status.completed

		if (!task.status.completed) {
			task.startTime = task.startTime || new Date()
			task.endTime =
				task.endTime ||
				new Date(new Date().setHours(new Date().getHours() + 24))
		}

		await task.save()

		const message = task.status.completed
			? 'Task marked as complete!'
			: 'Task marked as incomplete!'
		await updateUserStatistics(req.userId)

		res.json({ message })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to toggle task completion!' })
	}
}

export const deleteTask = async (req, res) => {
	try {
		const taskId = req.params.id
		const task = await taskModel.findByIdAndDelete(taskId)

		if (!task) {
			return res.status(404).json({ message: 'Task not found!' })
		}

		await updateUserStatistics(req.userId)

		res.json({ message: 'Task deleted successfully!' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to delete task!' })
	}
}

export const archiveExpiredTasks = async () => {
	const now = new Date()
	try {
		const tasksToArchive = await taskModel.find({
			endTime: { $lt: now },
			'status.isArchiving': false,
		})

		if (tasksToArchive.length > 0) {
			console.log(`Found ${tasksToArchive.length} tasks to archive.`)

			const result = await taskModel.updateMany(
				{ endTime: { $lt: now }, 'status.isArchiving': false },
				{ $set: { 'status.isArchiving': true } }
			)

			console.log(`Archived ${result.nModified} tasks.`)
		} else {
			console.log('No tasks to archive.')
		}
	} catch (error) {
		console.error('Error archiving tasks:', error)
	}
}
export const unarchiveAllExpiredTasks = async () => {
	const now = new Date()
	try {
		const tasksToUnarchive = await taskModel.find({
			endTime: { $lt: now },
			'status.isArchiving': true,
			'status.archived': true,
		})

		if (tasksToUnarchive.length > 0) {
			console.log(`Found ${tasksToUnarchive.length} tasks to unarchive.`)

			// Unarchive the found tasks
			const result = await taskModel.updateMany(
				{ endTime: { $lt: now }, 'status.isArchiving': true },
				{ $set: { 'status.isArchiving': false } }
			)

			console.log(`Unarchived ${result.modifiedCount} tasks.`)
		} else {
			console.log('No tasks to unarchive.')
		}
	} catch (error) {
		console.error('Error unarchiving tasks:', error)
	}
}

export const unarchiveExpiredTasks = async taskId => {
	const now = new Date()
	try {
		const task = await taskModel.findById(taskId)

		if (task) {
			if (task.endTime > now && task.status.isArchiving) {
				await taskModel.updateOne(
					{ _id: taskId },
					{ $set: { 'status.isArchiving': false } }
				)
			}
		}
	} catch (error) {
		console.error('Error unarchiving task:', error)
	}
}

export const searchTasks = async (req, res) => {
	try {
		const { query } = req.query

		if (!query) {
			return res.status(400).json({ message: 'Search query is required!' })
		}

		const searchRegex = new RegExp(query, 'i')
		const tasks = await taskModel
			.find({
				$or: [
					{ title: { $regex: searchRegex } },
					{ description: { $regex: searchRegex } },
					{ 'category.name': { $regex: searchRegex } },
				],
			})
			.populate('category status')

		res.json(tasks)
	} catch (error) {
		console.error('Search error:', error)
		res
			.status(500)
			.json({ message: 'Failed to search tasks!', error: error.message })
	}
}

export const getArchivedTasks = async (req, res) => {
	try {
		const archivedTasks = await taskModel
			.find({ 'status.archived': true })
			.populate('category')
			.populate('status')

		res.json(archivedTasks)
	} catch (error) {
		console.error('Error fetching archived tasks:', error)
		res.status(500).json({
			message: 'Failed to fetch archived tasks!',
			error: error.message,
		})
	}
}
