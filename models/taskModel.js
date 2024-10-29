import mongoose, { Schema } from 'mongoose'

export const CategorySchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

export const Category = mongoose.model('Category', CategorySchema)

export const defaultCategory = async () => {
	let category = await Category.findOne({ name: 'Default' })
	if (!category) {
		category = await Category.create({ name: 'Default' })
	}
	return { name: category.name }
}

const StatusSchema = new Schema(
	{
		completed: {
			type: Boolean,
			default: false,
		},
		archived: {
			type: Boolean,
			default: false,
		},
		isArchiving: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

export const Status = mongoose.model('Status', StatusSchema)

export const defaultStatus = async () => {
	let status = await Status.findOne({ completed: false, archived: false })
	if (!status) {
		status = await Status.create({ completed: false, archived: false })
	}
	return status
}

const TaskSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: String,
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		startTime: {
			type: Date,
			default: Date.now,
		},
		endTime: {
			type: Date,
			default: () => Date.now() + 86400000,
		},
		category: {
			type: CategorySchema,
			default: async () => await defaultCategory(),
		},
		status: {
			type: StatusSchema,
			default: async () => await defaultStatus(),
		},
	},
	{
		timestamps: true,
	}
)

TaskSchema.pre('save', async function (next) {
	if (!this.category || Object.keys(this.category).length === 0) {
		this.category = await defaultCategory()
	}
	if (!this.status || Object.keys(this.status).length === 0) {
		this.status = await defaultStatus()
	}
	next()
})

export const taskModel = mongoose.model('Task', TaskSchema)
