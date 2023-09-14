import { build } from 'esbuild'
import fs from 'fs/promises'

try {
	const SERVER_URL = {
		development: 'http://localhost:3002',
		staging: 'https://bdn.notice-staging.studio',
		production: 'https://bdn.notice.studio',
	}

	await build({
		entryPoints: ['./src/index.ts'],
		outfile: './lib/index.js',
		bundle: true,
		minify: process.env.STAGE === 'production',
		sourcemap: true,
		target: ['chrome106', 'firefox110', 'safari16'],
		logLevel: 'debug',
		color: true,
		define: {
			['process.env.SERVER_URL']: `"${SERVER_URL[process.env.STAGE ?? 'development']}"`,
		},
	})

	await fs.writeFile('./lib/index.css', '')

	process.exit(0)
} catch (_) {
	process.exit(1)
}
