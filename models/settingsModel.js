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
	},
	{
		timestamps: true,
	}
)

export const settingsModel = mongoose.model('Settings', SettingsSchema)
