import { reminderModel } from '../models/index.js'

export const createReminder = async (req, res) => {
	try {
		const { time, message } = req.body

		const reminder = new reminderModel({
			userId: req.userId,
			time,
			message,
		})

		await reminder.save()
		res.json(reminder)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to create reminder!' })
	}
}

export const getAllReminders = async (req, res) => {
	try {
		const reminders = await reminderModel.find({ userId: req.userId })
		res.json(reminders)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to get reminders!' })
	}
}

export const getReminderbyId = async (req, res) => {
	try {
		const reminder = await reminderModel.findById(req.params.id)

		if (!reminder || reminder.userId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Reminder not found!' })
		}

		res.json(reminder)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to get reminder!' })
	}
}

export const updateReminder = async (req, res) => {
	try {
		const { message, time } = req.body
		const reminder = await reminderModel.findById(req.params.id)

		if (!reminder || reminder.userId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Reminder not found!' })
		}

		if (message !== undefined) reminder.message = message
		if (time !== undefined) reminder.time = time

		await reminder.save()
		res.json(reminder)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to update reminder!' })
	}
}

export const deleteReminder = async (req, res) => {
	try {
		const reminder = await reminderModel.findById(req.params.id)

		if (!reminder || reminder.userId.toString() !== req.userId) {
			return res.status(404).json({ message: 'Reminder not found!' })
		}

		await reminderModel.deleteOne({ _id: req.params.id })
		res.json({ message: 'Reminder deleted!' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to delete reminder!' })
	}
}
