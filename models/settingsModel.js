import mongoose, { Schema } from 'mongoose'

const SettingsSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		theme: {
			type: String,
			enum: ['light', 'dark'],
			default: 'light',
		},
		notifications: {
			email: {
				type: Boolean,
				default: true,
			},
			reminders: {
				type: Boolean,
				default: true,
			},
		},
	},
	{
		timestamps: true,
	}
)

export const settingsModel = mongoose.model('Settings', SettingsSchema)
