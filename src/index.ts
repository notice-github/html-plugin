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
				const integration = elem.attributes.getNamedItem('notice-integration')?.value || undefined
				if (integration != undefined) {
					setTimeout(() => {
						window.$NTC[res.data.rootId].integrationType = integration
					}, 100)
				}
			})
		})
	}

	window.__NTC_BUNDLE_LOAD()
}
