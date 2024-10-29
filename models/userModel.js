import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			required: true,
			default: 'USER',
		},
		avatarUrl: {
			type: String,
			default: '',
		},
		country: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
	},
	{
		timestamps: true,
	}
)

export const userModel = mongoose.model('User', UserSchema)
