import { EventEmitter } from './event-emitter';

describe('EventEmitter', () => {

	let emmiter: EventEmitter<number>;

	beforeEach(() => {
		emmiter = new EventEmitter<number>();
	});

	it('fire() forwards event to listeners', () => {
		expect(emmiter.count()).toEqual(0);

		const values: number[] = [];

		function listener(val: number) {
			values.push(val);
		}

		emmiter.addListener(listener);

		emmiter.fire(300);

		expect(values.length).toEqual(1);
		expect(values[0]).toEqual(300);

		emmiter.removeListener(listener);

		emmiter.fire(200);

		expect(values.length).toEqual(1);
	});

	it('addListener() throws error when emitter doesn`t contain listener', () => {
		function listener() {
		}

		expect(() => emmiter.removeListener(listener))
			.toThrowError();
	});
});
