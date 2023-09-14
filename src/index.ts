async function injectNotice(elem: HTMLElement) {
	const projectId = elem.attributes.getNamedItem('project-id')
	if (!projectId || !projectId.value) return

	const url = new URL(`${process.env.SERVER_URL}/pages/${projectId.value}/full`)

	const searchParams = new URLSearchParams(document.location.href.split('?')[1])
	if (searchParams.has('page')) {
		const pageId = searchParams.get('page')?.match?.(/^[^#]*/)?.[0]
		if (pageId != null) url.searchParams.append('page', pageId)
	}
	if (searchParams.has('lang')) {
		const lang = searchParams.get('lang')?.match?.(/^[^#]*/)?.[0]
		if (lang != null) url.searchParams.append('lang', lang)
	}

	const theme = localStorage.getItem('NTC_theme')
	if (theme != null) url.searchParams.append('theme', theme === 'dark' ? 'dark' : 'light')

	const data = await fetch(url.href).then((res) => res.json())

	// Head
	const parser = new DOMParser()
	const dom = parser.parseFromString(data.head, 'text/html')
	for (let node of dom.head.childNodes) {
		if (!(node instanceof HTMLElement)) continue

		if (node.nodeName === 'TITLE') {
			document.title = node.innerText
			continue
		} else if (node.nodeName === 'LINK' && node.getAttribute('rel') === 'icon') {
			document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
		}

		document.head.appendChild(node)
	}

	// Style
	const style = document.createElement('style')
	style.id = `NTC_style-${data.rootId}`
	style.innerHTML = data.styles
	document.head.appendChild(style)

	// Script
	const script = document.createElement('script')
	script.innerHTML = data.scripts
	document.head.appendChild(script)

	// Body
	elem.outerHTML = data.body

	const integration = elem.attributes.getNamedItem('notice-integration')?.value || undefined
	if (integration != undefined) {
		setTimeout(() => {
			;(window as any).$NTC[data.rootId].integrationType = integration
		}, 100)
	}
}

;(() => {
	const targetContainers = document.querySelectorAll<HTMLElement>('.notice-target-container')
	targetContainers.forEach(injectNotice)
})()
