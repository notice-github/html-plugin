import { NTCBrowser } from '@notice-org/ntc'

declare global {
	interface Window {
		__NTC_BUNDLE_LOAD: () => any
		$NTC: any
	}
}

if (window.__NTC_BUNDLE_LOAD == undefined) {
	window.__NTC_BUNDLE_LOAD = function () {
		const targetContainers = document.querySelectorAll<HTMLElement>('.notice-target-container')

		targetContainers.forEach(async function (elem: HTMLElement) {
			const attributes: Record<string, string> = {}
			for (let i = 0; i < elem.attributes.length; i++) {
				const attr = elem.attributes.item(i)
				if (!attr) continue
				attributes[attr.name.replace(/\W+(.)/g, (_, ch) => ch.toUpperCase())] = attr.value
			}

			let { projectId, noticeIntegration, ...params } = attributes

			if (!projectId) return

			// Wordress exception
			if (elem.classList.contains('wp-block-noticefaq-block-noticefaq')) noticeIntegration = 'wordpress-plugin'

			if (noticeIntegration) params['integration'] = noticeIntegration

			NTCBrowser.queryDocument(projectId, params).then((res) => {
				if (!res.ok) return
				elem.outerHTML = res.data
			})
		})
	}

	window.__NTC_BUNDLE_LOAD()
}
