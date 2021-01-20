
export interface Attributes {
	[name: string]: any;
}

export function createSvgElement<K extends keyof SVGElementTagNameMap>(
	name: K,
	attributes?: Attributes): SVGElementTagNameMap[K] {
	const element = document.createElementNS('http://www.w3.org/2000/svg', name);
	if (attributes) {
		setAttrs(element, attributes);
	}
	return element;
}

export function setAttrs(element: Element, attributes: Attributes) {
	Object.keys(attributes).forEach(name => {
		const value = attributes[name];
		element.setAttribute(name, value.toString());
	});
}

export function isChildOf(parent: Node, child: Node): boolean {
	do {
		if (child === parent) {
			return true;
		}
		child = child.parentNode;
	} while (child);
	return false;
}

export function tryFind<T>(array: T[], p: (item: T) => boolean): T | null {
	for (const item of array) {
		if (p(item)) {
			return item;
		}
	}
	return null;
}

export function animate(func: (percent: number) => void, duration: number) {
	const startTime = Date.now();
	const iv = setInterval(() => {
		const percent = (Date.now() - startTime) / duration;
		if (percent >= 1) {
			clearInterval(iv);
			func(1);
		} else {
			func(percent);
		}
	}, 10);
}
