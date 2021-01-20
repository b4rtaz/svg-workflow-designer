import { createSvgElement } from '../utils';
import { Activity } from './activity';
import { Designer } from './designer';

export class Control {
	public selectedActivity: Activity;

	public readonly view: ControlView = new ControlView(this);

	public constructor(
		public readonly designer: Designer) {
	}

	public onDeleteClicked(e: Event) {
		e.preventDefault();

		const activityName = this.designer.host.tryGetSelectedActivityName();
		this.designer.host.deleteActivity(activityName);
		this.selectedActivity = null;
		this.view.updateView();
	}

	public onEditClicked(e: Event) {
		e.preventDefault();

		const activityName = this.designer.host.tryGetSelectedActivityName();
		if (activityName) {
			this.designer.host.onEditRequested.fire(activityName);
		}
	}

	public onCenterClicked(e: Event) {
		e.preventDefault();
		this.designer.host.scrollToCenter();
	}
}

class ControlView {

	private bar: HTMLElement;
	private activityBar: HTMLElement;
	private deleteButton: HTMLElement;

	public constructor(
		private readonly state: Control) {
	}

	public createView(parent: HTMLElement) {
		this.bar = document.createElement('div');
		this.bar.className = 'wfd-bar';

		this.activityBar = document.createElement('span');
		this.activityBar.classList.add('wfd-bar-activity');
		this.activityBar.classList.add('hidden');

		this.deleteButton = createIconButton(
			'4 4 16 16',
			'M14.8,12l3.6-3.6c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0L12,9.2L8.4,5.6c-0.8-0.8-2-0.8-2.8,0 c-0.8,0.8-0.8,2,0,2.8L9.2,12l-3.6,3.6c-0.8,0.8-0.8,2,0,2.8C6,18.8,6.5,19,7,19s1-0.2,1.4-0.6l3.6-3.6l3.6,3.6 C16,18.8,16.5,19,17,19s1-0.2,1.4-0.6c0.8-0.8,0.8-2,0-2.8L14.8,12z',
			'danger');
		this.activityBar.appendChild(this.deleteButton);

		const settingsButton = createIconButton(
			'0 0 24 24',
			'M22.2,14.4L21,13.7c-1.3-0.8-1.3-2.7,0-3.5l1.2-0.7c1-0.6,1.3-1.8,0.7-2.7l-1-1.7c-0.6-1-1.8-1.3-2.7-0.7   L18,5.1c-1.3,0.8-3-0.2-3-1.7V2c0-1.1-0.9-2-2-2h-2C9.9,0,9,0.9,9,2v1.3c0,1.5-1.7,2.5-3,1.7L4.8,4.4c-1-0.6-2.2-0.2-2.7,0.7   l-1,1.7C0.6,7.8,0.9,9,1.8,9.6L3,10.3C4.3,11,4.3,13,3,13.7l-1.2,0.7c-1,0.6-1.3,1.8-0.7,2.7l1,1.7c0.6,1,1.8,1.3,2.7,0.7L6,18.9   c1.3-0.8,3,0.2,3,1.7V22c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2v-1.3c0-1.5,1.7-2.5,3-1.7l1.2,0.7c1,0.6,2.2,0.2,2.7-0.7l1-1.7   C23.4,16.2,23.1,15,22.2,14.4z M12,16c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4s4,1.8,4,4C16,14.2,14.2,16,12,16z',
			'secondary');
		this.activityBar.appendChild(settingsButton);

		parent.appendChild(this.bar);

		const centerButton = createIconButton(
			'0 0 20 20',
			'M17.94 11H13V9h4.94A8 8 0 0 0 11 2.06V7H9V2.06A8 8 0 0 0 2.06 9H7v2H2.06A8 8 0 0 0 9 17.94V13h2v4.94A8 8 0 0 0 17.94 11zM10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20z',
			'secondary');

		this.activityBar.appendChild(this.deleteButton);
		this.activityBar.appendChild(settingsButton);

		this.bar.appendChild(this.activityBar);
		this.bar.appendChild(centerButton);
		parent.appendChild(this.bar);

		this.deleteButton.addEventListener('click', e => this.state.onDeleteClicked(e));
		settingsButton.addEventListener('click', e => this.state.onEditClicked(e));
		centerButton.addEventListener('click', e => this.state.onCenterClicked(e));
	}

	public updateView() {
		if (this.state.selectedActivity) {
			if (this.state.selectedActivity.canDelete && !this.state.designer.isReadOnly) {
				this.deleteButton.classList.remove('hidden');
			} else {
				this.deleteButton.classList.add('hidden');
			}
			this.activityBar.classList.remove('hidden');
		} else {
			this.activityBar.classList.add('hidden');
		}
	}
}

function createIconButton(viewBox: string, d: string, buttonClassName: string): HTMLButtonElement {
	const icon = createSvgElement('svg', {
		'viewBox': viewBox
	});
	icon.appendChild(createSvgElement('path', {
		'd': d,
		'class': 'wfd-bar-button-icon'
	}));
	const button = document.createElement('button');
	button.className = `wfd-bar-button ${buttonClassName}`;
	button.appendChild(icon);
	return button;
}
