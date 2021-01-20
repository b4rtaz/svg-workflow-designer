import { Designer } from './designer';
import { InteractionType } from './interaction';

export function doubleClickAction(e: Event, designer: Designer) {
	const info = designer.checkClick(e.target as Element);
	if (info && info.type === InteractionType.moveActivity && !this.isReadOnly) {
		designer.host.onEditRequested.fire(info.activity.name);
	}
}
