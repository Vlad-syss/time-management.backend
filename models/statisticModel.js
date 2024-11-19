import mongoose, { Schema } from 'mongoose'

const StatisticSchema = new Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		allCompleted: {
			type: Number,
			required: true,
		},
		allArchived: {
			type: Number,
			required: true,
		},
		averageTime: {
			type: Number,
			required: true,
		},
		completedOnTime: {
			type: Number,
			required: true,
		},
		completedLate: {
			type: Number,
			required: true,
		},
		categories: [
			{
				name: { type: String, required: true },
				taskCount: { type: Number, required: true },
				averageTime: { type: Number, required: true },
			},
		],
		dailyPerformance: {
			type: Map,
			of: Number,
			required: true,
		},
		monthlyPerformance: {
			type: Map,
			of: Number,
		},
		bestDay: {
			type: String,
		},
		rescheduledTasks: {
			type: Number,
			required: true,
		},
		longestTaskTime: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

export const statisticModel = mongoose.model('Statistic', StatisticSchema)
