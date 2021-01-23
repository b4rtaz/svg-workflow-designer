import { Vector } from './vector';

describe('Vector', () => {

	const A = new Vector(2, 10);

	it('add() returns proper value', () => {
		const r = A.add(new Vector(2, 1));
		expect(r.x).toEqual(4);
		expect(r.y).toEqual(11);
	});

	it('subtract() returns proper value', () => {
		const r = A.subtract(new Vector(2, 1));
		expect(r.x).toEqual(0);
		expect(r.y).toEqual(9);
	});

	it('multiplyConst() returns proper value', () => {
		const r = A.multiplyConst(2);
		expect(r.x).toEqual(4);
		expect(r.y).toEqual(20);
	});

	it('divideConst() returns proper value', () => {
		const r = A.divideConst(2);
		expect(r.x).toEqual(1);
		expect(r.y).toEqual(5);
	});

	it('round() returns proper value', () => {
		const d = new Vector(1.6, 1.3).round();
		expect(d.x).toEqual(2);
		expect(d.y).toEqual(1);
	});

	it('distance() returns proper value', () => {
		const d = A.distance(new Vector(4, 10));
		expect(d).toEqual(2);
	});

	it('angleRad() returns proper value', () => {
		const a = A.angleRad(new Vector(4, 10));
		expect(a).toEqual(180);
	});
});
