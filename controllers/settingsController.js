import { settingsModel } from '../models/index.js'

export const getSettings = async (req, res) => {
	try {
		let settings = await settingsModel.findOne({ user: req.userId })

		if (!settings) {
			settings = new settingsModel({ user: req.userId })
			await settings.save()
		}
		res.json(settings)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to get settings!' })
	}
}

export const updateSettings = async (req, res) => {
	try {
		const updates = req.body

		const settings = await settingsModel.findOneAndUpdate(
			{ user: req.userId },
			{ $set: updates },
			{ new: true, upsert: true }
		)

		if (!settings) {
			return res.status(404).json({ message: 'Settings not found!' })
		}

		res.json({ settings, success: true })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to update settings!' })
	}
}
