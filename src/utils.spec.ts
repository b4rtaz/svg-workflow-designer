import { animate, createSvgElement, isChildOf, setAttrs, tryFind } from './utils';

describe('Utils', () => {

	it('createSvgElement() returns proper value', () => {
		const svg1 = createSvgElement('svg');
		expect(svg1.tagName).toEqual('svg');

		const svg2 = createSvgElement('svg', {
			width: 11,
			height: '22'
		});
		expect(svg2.tagName).toEqual('svg');
		expect(svg2.getAttribute('width')).toEqual('11');
		expect(svg2.getAttribute('height')).toEqual('22');
	});

	it('setAttrs() works as expected', () => {
		const div = document.createElement('div');
		setAttrs(div, {
			'data-x': '100'
		});
		expect(div.getAttribute('data-x')).toEqual('100');
	});

	it('isChildOf() returns proper value', () => {
		const a = document.createElement('div');
		const b = document.createElement('div');
		const c = document.createElement('div');
		a.appendChild(b);
		b.appendChild(c);

		expect(isChildOf(b, c)).toBeTrue();
		expect(isChildOf(b, a)).toBeFalse();
	});

	it('tryFind() returns proper value', () => {
		const arr = [ { a: 1 }, { a: 2 }, { a: 3 }];

		expect(tryFind(arr, i => i.a === 1)).toBeDefined();
		expect(tryFind(arr, i => i.a === 4)).toBeNull();
	});

	it('animate() works as expected', () => {
		const percents: number[] = [];
		let func: Function;
		let now = 1000;
		let cleared = false;

		spyOn(Date, 'now').and.callFake(() => {
			return now;
		});
		spyOn(window, 'setInterval').and.callFake((callback: any, ms: number, ...args: any[]) => {
			func = callback;
			return 1 as any;
		});
		spyOn(window, 'clearInterval').and.callFake(() => {
			cleared = true;
		});

		animate(percent => {
			percents.push(percent);
		}, 100);

		expect(percents.length).toEqual(0);

		now = 1030;
		func();
		expect(percents[0]).toEqual(0.3);

		now = 1090;
		func();
		expect(percents[1]).toEqual(0.9);

		now = 1101;
		func();
		expect(percents[2]).toEqual(1);

		expect(cleared).toBeTrue();
	});
});
