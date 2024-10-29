import { body } from 'express-validator'

export const registerValidation = [
	body('email', 'Invalid email format!').trim().isEmail(),
	body('password', 'Password must be at least 5 characters long!').isLength({
		min: 5,
	}),
	body('name', 'Please provide a name!').isLength({ min: 3 }),
	body('avatarUrl', 'Invalid avatar URL!').optional().isURL(),
]

export const updateProfileValidation = [
	body('email', 'Invalid email format!').optional().trim().isEmail(),
	body('password', 'Password must be at least 5 characters long!')
		.optional()
		.isLength({
			min: 5,
		}),
	body('name', 'Please provide a name!').optional().isLength({ min: 3 }),
	body('avatarUrl', 'Invalid avatar URL!').optional().isURL(),
	body('country', 'Country need to be UPPERCASE!').optional().isUppercase(),
]

export const loginValidation = [
	body('email', 'Invalid email format!').trim().isEmail(),
	body('password', 'Password must be at least 5 characters long!').isLength({
		min: 5,
	}),
]
