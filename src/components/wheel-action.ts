import { DESIGNER_MAX_SCALE, DESIGNER_MIN_SCALE, DESIGNER_SCALE_STEP } from './constants';
import { Designer } from './designer';

export function wheelAction(e: WheelEvent, designer: Designer) {
	const delta = (e.deltaY > 0)
		? DESIGNER_SCALE_STEP
		: -DESIGNER_SCALE_STEP;
	const newScale = Math.max(DESIGNER_MIN_SCALE, Math.min(DESIGNER_MAX_SCALE, designer.scale - delta));

	designer.scrollPosition = designer.scrollPosition.multiplyConst(newScale / designer.scale);
	designer.scale = newScale;
	designer.view.updateViewPort();
}
