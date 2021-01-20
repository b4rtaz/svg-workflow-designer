
export class EventEmitter<T> {
	private readonly listeners: EventListener<T>[] = [];

	public addListener(listener: EventListener<T>) {
		this.listeners.push(listener);
	}

	public fire(arg: T) {
		this.listeners.forEach(l => l(arg));
	}
}

export type EventListener<T> = (arg: T) => void;
