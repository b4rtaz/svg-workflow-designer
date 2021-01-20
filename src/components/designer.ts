import { DesignerHost } from '../designer-host';
import { createSvgElement, isChildOf, setAttrs, tryFind } from '../utils';
import { Vector } from '../vector';
import { Action } from './action';
import { Activity } from './activity';
import { Connection } from './connection';
import { GRID_SIZE } from './constants';
import { Control } from './control';
import { doubleClickAction } from './double-click-action';
import { Interaction, InteractionInfo, InteractionType, readMouseEvent, readTouchEvent } from './interaction';
import { MoveActivityAction } from './move-activity-action';
import { MoveConnectionAction } from './move-connection-action';
import { ScrollAction } from './scroll-action';
import { wheelAction } from './wheel-action';

export class Designer {
	public readonly view = new DesignerView(this);
	public readonly control = new Control(this);
	public readonly activities: Activity[] = [];

	public isReadOnly = false;
	public scale = 1;
	public scrollPosition = new Vector(0, 0);
	private action?: Action = null;

	public constructor(
		public readonly host: DesignerHost) {
	}

	public getActivity(name: string) {
		const activity = tryFind(this.activities, a => a.name === name);
		if (!activity) {
			throw new Error(`Cannot find ${name} activity.`);
		}
		return activity;
	}

	public tryGetSelectedActivity(): Activity | null {
		return tryFind(this.activities, a => a.isSelected);
	}

	public getUniqueConnections(): Connection[] {
		const connections: Connection[] = [];
		this.activities.forEach(activity => {
			activity.inputConnectors.concat(activity.outputConnectors).forEach(connector => {
				connector.connections.forEach(c => {
					if (connections.indexOf(c) < 0) {
						connections.push(c);
					}
				});
			});
		});
		return connections;
	}

	public checkClick(target: Element): InteractionInfo | null {
		for (const activity of this.activities) {
			const info = activity.checkClick(target);
			if (info) {
				return info;
			}
		}
		if (this.view.hasElement(target)) {
			return {
				type: InteractionType.scroll
			};
		}
		return null;
	}

	public onDoubleClick(e: Event) {
		e.preventDefault();
		doubleClickAction(e, this);
	}

	public onWheel(e: WheelEvent) {
		wheelAction(e, this);
	}

	public onMouseDown(e: MouseEvent) {
		e.preventDefault();
		this.startAction(readMouseEvent(e));
	}

	public onMouseMove(e: MouseEvent) {
		e.preventDefault();
		this.moveAction(readMouseEvent(e));
	}

	public onMouseUp(e: MouseEvent) {
		e.preventDefault();
		this.finishAction(readMouseEvent(e));
	}

	public onTouchStart(e: TouchEvent) {
		e.preventDefault();
		this.startAction(readTouchEvent(e));
	}

	public onTouchMove(e: TouchEvent) {
		e.preventDefault();
		this.moveAction(readTouchEvent(e));
	}

	public onTouchEnd(e: TouchEvent) {
		e.preventDefault();
		this.finishAction(readTouchEvent(e));
	}

	private startAction(i: Interaction) {
		if (this.action) {
			this.view.unbindGlobalMouseEvents();
			this.action.finish(i);
			this.action = null;
			return;
		}

		const info = this.checkClick(i.target);
		if (info) {
			this.view.bindGlobalMouseEvents();
			switch (info.type) {
				case InteractionType.moveActivity:
					if (!this.isReadOnly) {
						this.action = new MoveActivityAction(info, this);
					}
					break;
				case InteractionType.moveOutputConnection:
				case InteractionType.moveInputConnection:
					if (!this.isReadOnly) {
						this.action = new MoveConnectionAction(info, this);
					}
					break;
				case InteractionType.scroll:
					this.action = new ScrollAction(this);
					break;
			}
			if (this.action) {
				this.action.start(i);
			}
		}
	}

	private moveAction(i: Interaction) {
		if (this.action) {
			this.action.move(i);
		}
	}

	private finishAction(i: Interaction) {
		if (this.action) {
			this.view.unbindGlobalMouseEvents();
			this.action.finish(i);
			this.action = null;
		}
	}
}

class DesignerView {
	public container: HTMLElement;
	public svg: SVGSVGElement;
	public root: SVGGElement;
	public activitiesLayer: SVGGElement;
	public connectionsLayer: SVGGElement;
	public gridPattern: SVGPatternElement;
	public gridPatternPath: SVGPathElement;

	private lastGridSize: number | number = null;

	private readonly mouseMoveHandler: MouseEventHandler = (e) => this.state.onMouseMove(e);
	private readonly mouseUpHandler: MouseEventHandler = (e) => this.state.onMouseUp(e);
	private readonly touchMoveHandler: TouchEventHandler = (e) => this.state.onTouchMove(e);
	private readonly touchEndHandler: TouchEventHandler = (e) => this.state.onTouchEnd(e);

	private static _nextGridPatternId = 0;

	public constructor(
		private readonly state: Designer) {
	}

	public createView(parent: HTMLElement, theme: string) {
		window.addEventListener('resize', () => this.onResized());

		this.container = document.createElement('div');
		this.container.classList.add('wfd-designer');
		this.container.classList.add(`wfd-theme-${theme}`);

		const gridPatternId = 'wfd-grid-' + DesignerView._nextGridPatternId++;
		this.gridPatternPath = createSvgElement('path', {
			'fill': 'none',
			'class': 'wfd-grid'
		});
		this.gridPattern = createSvgElement('pattern', {
			'id': gridPatternId,
			'patternUnits': 'userSpaceOnUse'
		});
		this.gridPattern.appendChild(this.gridPatternPath);

		const defs = createSvgElement('defs', null);
		defs.appendChild(this.gridPattern);

		this.root = createSvgElement('g');
		this.activitiesLayer = createSvgElement('g');
		this.connectionsLayer = createSvgElement('g', {
			'style': 'pointer-events: none;'
		});
		this.root.appendChild(this.activitiesLayer);
		this.root.appendChild(this.connectionsLayer);

		const grid = createSvgElement('rect', {
			'width': '100%',
			'height': '100%',
			'fill': `url(#${gridPatternId})`
		});

		this.svg = createSvgElement('svg');
		this.svg.addEventListener('wheel', e => this.state.onWheel(e));
		this.svg.addEventListener('mousedown', e => this.state.onMouseDown(e));
		this.svg.addEventListener('touchstart', e => this.state.onTouchStart(e));
		this.svg.addEventListener('dblclick', e => this.state.onDoubleClick(e));
		this.svg.appendChild(defs);
		this.svg.appendChild(createSvgElement('rect', {
			'width': '100%',
			'height': '100%',
			'class': 'wfd-grid-rect'
		}));
		this.svg.appendChild(grid);
		this.svg.appendChild(this.root);

		this.container.appendChild(this.svg);

		this.state.control.view.createView(this.container);

		parent.appendChild(this.container);
		this.updateSize();
		this.updateViewPort();
		this.updateIsReadonly();
	}

	private updateSize() {
		const size = this.getSize();
		setAttrs(this.svg, {
			width: size.x,
			height: size.y
		});
	}

	public updateViewPort() {
		const vp = this.state.scrollPosition;
		setAttrs(this.root, {
			'transform': `translate(${vp.x}, ${vp.y}) scale(${this.state.scale})`
		});
		setAttrs(this.gridPattern, {
			'x': vp.x,
			'y': vp.y,
		});
		const size = this.state.scale * GRID_SIZE;
		if (this.lastGridSize !== size) {
			this.lastGridSize = size;

			setAttrs(this.gridPattern, {
				'width': size,
				'height': size,
				'transform': `scale(${this.state.scale})`
			});
			setAttrs(this.gridPatternPath, {
				'd': `M ${size} 0 L 0 0 0 ${size}`
			});
		}
	}

	public updateIsReadonly() {
		if (this.state.isReadOnly) {
			this.container.classList.remove('wfd-editable');
		} else {
			this.container.classList.add('wfd-editable');
		}
	}

	public bindGlobalMouseEvents() {
		document.body.addEventListener('mousemove', this.mouseMoveHandler);
		document.body.addEventListener('mouseup', this.mouseUpHandler);
		document.body.addEventListener('touchmove', this.touchMoveHandler);
		document.body.addEventListener('touchend', this.touchEndHandler);
	}

	public unbindGlobalMouseEvents() {
		document.body.removeEventListener('mousemove', this.mouseUpHandler);
		document.body.removeEventListener('mouseup', this.mouseUpHandler);
		document.body.removeEventListener('touchmove', this.touchMoveHandler);
		document.body.removeEventListener('touchend', this.touchEndHandler);
	}

	public hasElement(element: Element): boolean {
		return isChildOf(this.svg, element);
	}

	public getSize(): Vector {
		const parent = this.container.parentElement;
		return new Vector(parent.offsetWidth, parent.offsetHeight);
	}

	private onResized() {
		this.updateSize();
	}
}

type MouseEventHandler = (e: MouseEvent) => void;
type TouchEventHandler = (e: TouchEvent) => void;

