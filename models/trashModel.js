import mongoose, { Schema } from 'mongoose'

const TrashSchema = new Schema(
	{
		task: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Task',
			required: true,
		},
		autoDeleteTime: {
			type: Date,
			required: true,
			default: Date.now() + 86400000 * 30,
		},
	},
	{
		timestamps: true,
	}
)

TrashSchema.index({ archivedAt: 1 }, { expireAfterSeconds: 2592000 })

export const trashModel = mongoose.model('Trash', TrashSchema)
