import bcrypt from 'bcrypt'

import fs from 'fs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import { userModel } from '../models/index.js'
import { initializeStatistics } from './statisticController.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const register = async (req, res) => {
	try {
		const password = req.body.password
		const salt = await bcrypt.genSalt(10)
		const hash = await bcrypt.hash(password, salt)

		const doc = new userModel({
			passwordHash: hash,
			name: req.body.name,
			email: req.body.email,
			avatarUrl: req.body.avatarUrl,
			country: req.body.country,
			description: req.body.description,
		})
		const user = await doc.save()

		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secretcodeihavenoenemies',
			{
				expiresIn: '30d',
			}
		)

		const { passwordHash, ...userData } = user._doc

		await initializeStatistics(user._id)

		res.json({
			...userData,
			token,
		})
	} catch (error) {
		console.log('error', error)
		res.status(500).json({
			message: 'Registration failed!',
		})
	}
}

export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email })

		if (!user) {
			return res.status(404).json({
				message: 'This user not found!',
			})
		}

		const isVallidPass = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		)

		if (!isVallidPass) {
			return res.status(400).json({
				message: 'Password is not vallid!',
			})
		}

		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secretcodeihavenoenemies',
			{
				expiresIn: '30d',
			}
		)

		const { passwordHash, ...userData } = user._doc

		res.json({
			...userData,
			token,
		})
	} catch (error) {
		console.log('error')
		res.status(500).json({
			message: 'Authorization failed!',
		})
	}
}

export const update = async (req, res) => {
	try {
		const userId = req.userId
		const updates = req.body

		if (updates.password) {
			const salt = await bcrypt.genSalt(10)
			updates.passwordHash = await bcrypt.hash(updates.password, salt)
			delete updates.password
		}

		const updatedUser = await userModel
			.findByIdAndUpdate(userId, { $set: updates }, { new: true })
			.select('-passwordHash')

		if (!updatedUser) {
			return res.status(404).json({ message: 'User not found!' })
		}

		res.json(updatedUser)
	} catch (error) {
		console.error('error', error)
		res.status(500).json({
			message: 'Update failed!',
		})
	}
}

export const getUserById = async (req, res) => {
	try {
		const user = await userModel.findById(req.userId)

		if (!user) {
			return res.status(404).json({
				message: 'This user not found!',
			})
		}

		const { passwordHash, ...userData } = user._doc

		res.json(userData)
	} catch (error) {
		console.log('error')
		res.status(500).json({
			message: 'Dont have an access!',
		})
	}
}

export const updateAvatar = async (req, res) => {
	try {
		const user = await userModel.findById(req.userId)

		if (!user) {
			return res.status(404).json({ message: 'User not found!' })
		}

		if (user.avatarUrl) {
			const oldAvatarPath = path.join(__dirname, '..', user.avatarUrl)
			fs.unlink(oldAvatarPath, err => {
				if (err) {
					console.error('Failed to delete old avatar:', err)
				}
			})
		}

		user.avatarUrl = `/uploads/${req.file.filename}`
		await user.save()

		res.json({
			message: 'Avatar updated successfully!',
			avatarUrl: user.avatarUrl,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to update avatar!' })
	}
}
