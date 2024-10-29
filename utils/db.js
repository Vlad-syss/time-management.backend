import mongoose from 'mongoose'
import config from '../config/config.js'

const connectDB = () => {
	mongoose
		.connect(config.db, {
			serverSelectionTimeoutMS: 5000,
		})
		.then(() => {
			console.log('Database connected successfully')
		})
		.catch(err => {
			console.error('Database connection error:', err)
		})

	return (req, res, next) => {
		next()
	}
}

export default connectDB
