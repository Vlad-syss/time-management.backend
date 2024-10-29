import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const defaults = {
	root: path.normalize(__dirname + '/..'),
}

const config = {
	development: {
		db: process.env.MONGO_URI,
		...defaults,
	},
	test: {
		db: process.env.MONGO_URI,
		...defaults,
	},
	production: {
		db: process.env.MONGO_URI,
		...defaults,
	},
}

export default config[process.env.NODE_ENV || 'development']
