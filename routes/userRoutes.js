import express from 'express'
import { upload } from '../config/multerConfig.js'
import { userController } from '../controllers/index.js'
import { checkAuth, handleValidationErrors } from '../utils/index.js'
import {
	loginValidation,
	registerValidation,
	updateProfileValidation,
} from '../validations.js'

export const router = express.Router()

router.post(
	'/register',
	registerValidation,
	handleValidationErrors,
	userController.register
)
router.post(
	'/login',
	loginValidation,
	handleValidationErrors,
	userController.login
)
router.put(
	'/update-user',
	updateProfileValidation,
	checkAuth,
	userController.update
)
router.get('/personal-cabinet', checkAuth, userController.getUserById)
router.post(
	'/upload/avatar',
	checkAuth,
	upload.single('avatar'),
	userController.updateAvatar
)
