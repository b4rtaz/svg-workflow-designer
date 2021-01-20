import { Vector } from '../vector';
import { Action } from './action';
import { Designer } from './designer';
import { Interaction } from './interaction';

export class ScrollAction implements Action {
	private offset: Vector;
	private moved = false;

	public constructor(
		private readonly designer: Designer) {
	}

	public start(i: Interaction) {
		this.offset = i.position.subtract(this.designer.scrollPosition);
	}

	public move(i: Interaction) {
		const pos = i.position.subtract(this.offset);
		this.moved = true;
		this.designer.scrollPosition = pos;
		this.designer.view.updateViewPort();
	}

	public finish() {
		if (!this.moved && !this.designer.isReadOnly) {
			this.designer.host.tryUnselectActivity();
		}
	}
}
