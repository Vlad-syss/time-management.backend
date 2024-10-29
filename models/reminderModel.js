import mongoose, { Schema } from 'mongoose'

const ReminderSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		time: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

export const reminderModel = mongoose.model('Reminder', ReminderSchema)
