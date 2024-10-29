import jwt from 'jsonwebtoken'
import { userModel } from '../models/index.js'

export default async (req, res, next) => {
	try {
		const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
		if (!token) {
			return res.status(403).json({
				message: 'Access denied!',
			})
		}

		const decoded = jwt.verify(token, 'secretcodeihavenoenemies')
		req.userId = decoded._id

		const user = await userModel.findById(req.userId)

		if (!user) {
			return res.status(404).json({
				message: 'User not found!',
			})
		}

		if (user.role !== 'ADMIN') {
			return res.status(403).json({
				message: 'Access denied! Admins only.',
			})
		}

		next()
	} catch (error) {
		console.log('error')
		res.status(500).json({
			message: 'Access denied!',
		})
	}
}
