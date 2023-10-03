import { NWeb } from '@notice-org/tools/lib/web'

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
			const projectId = elem.attributes.getNamedItem('project-id')
			if (!projectId || !projectId.value) return

			const browserParams = new URLSearchParams(document.location.href.split('?')[1])
			const queryParams = new URLSearchParams()

			// TMP
			let integration = elem.attributes.getNamedItem('notice-integration')?.value
			if (elem.classList.contains('wp-block-noticefaq-block-noticefaq')) integration = 'wordpress-plugin'
			if (integration === 'wordpress-plugin' && browserParams.has('article')) {
				browserParams.set('page', browserParams.get('article')!)
				browserParams.delete('article')
			}

			NWeb.useParam('lang', queryParams, { props: elem.attributes, params: browserParams })
			NWeb.useParam('theme', queryParams, {
				props: elem.attributes,
				params: browserParams,
				default: localStorage.getItem('NTC_theme'),
			})
			NWeb.useParam('page', queryParams, { props: elem.attributes, params: browserParams })

			NWeb.queryData(projectId.value, queryParams, new AbortController()).then((res) => {
				if (!res) return
				elem.outerHTML = res.data.body

				// TMP
				let it = elem.attributes.getNamedItem('notice-integration')?.value || undefined
				if (elem.classList.contains('wp-block-noticefaq-block-noticefaq')) it = 'wordpress-plugin'
				if (it != undefined) {
					setTimeout(() => {
						window.$NTC[res.data.rootId].integrationType = it
					}, 100)
				}
			})
		})
	}

	window.__NTC_BUNDLE_LOAD()
}
