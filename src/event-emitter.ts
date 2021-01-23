
export class EventEmitter<T> {
	private readonly listeners: EventListener<T>[] = [];

	public addListener(listener: EventListener<T>) {
		this.listeners.push(listener);
	}

	public removeListener(listener: EventListener<T>) {
		const index = this.listeners.indexOf(listener);
		if (index < 0) {
			throw new Error('Cannot find listener.');
		}
		this.listeners.splice(index, 1);
	}

	public count(): number {
		return this.listeners.length;
	}

	public fire(arg: T) {
		this.listeners.forEach(l => l(arg));
	}
}

export type EventListener<T> = (arg: T) => void;
