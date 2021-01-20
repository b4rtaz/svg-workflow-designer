import { Vector } from '../vector';
import { Activity } from './activity';
import { Connector } from './connector';

export interface Interaction {
	position: Vector;
	target: Element;
}

export enum InteractionType {
	moveOutputConnection = 1,
	moveInputConnection = 2,
	moveActivity = 3,
	scroll = 4
}

export interface InteractionInfo {
	type: InteractionType;
	activity?: Activity;
	connector?: Connector;
}

export function readMouseEvent(e: MouseEvent): Interaction {
	return {
		position: new Vector(e.pageX, e.pageY),
		target: e.target as Element
	};
}

export function readTouchEvent(e: TouchEvent): Interaction {
	if (e.touches.length > 0) {
		const touch = e.touches[0];
		return {
			position: new Vector(touch.pageX, touch.pageY),
			target: document.elementFromPoint(touch.pageX, touch.pageY)
		};
	}
	return {
		position: null,
		target: null
	};
}
