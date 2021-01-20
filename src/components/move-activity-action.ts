import { Vector } from '../vector';
import { Action } from './action';
import { Designer } from './designer';
import { Interaction, InteractionInfo } from './interaction';

export class MoveActivityAction implements Action {

	private offset: Vector;
	private moved = false;

	public constructor(
		private readonly info: InteractionInfo,
		private readonly designer: Designer) {
	}

	public start(i: Interaction) {
		this.offset = i.position
			.divideConst(this.designer.scale)
			.subtract(this.info.activity.position);
		this.moved = false;
	}

	public move(i: Interaction) {
		const position = i.position
			.divideConst(this.designer.scale)
			.subtract(this.offset)
			.round();
		this.info.activity.position = position;
		this.info.activity.view.updatePostionOfView();
		this.info.activity.view.updateConnectionViews();
		this.moved = true;
	}

	public finish() {
		if (!this.moved) {
			this.designer.host.selectActivity(this.info.activity.name);
		}
	}
}
