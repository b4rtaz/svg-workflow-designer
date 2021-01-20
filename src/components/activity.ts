import { ActivityDefinition } from '../model';
import { createSvgElement, isChildOf, setAttrs, tryFind } from '../utils';
import { Vector } from '../vector';
import { Connector, ConnectorDirection } from './connector';
import {
	ACTIVITY_HEIGHT,
	ACTIVITY_INVALID_ICON_HEIGHT,
	ACTIVITY_INVALID_ICON_WIDTH,
	ACTIVITY_LABEL_PADDING_X,
	ACTIVITY_MIN_WIDTH,
	CONNECTOR_HEIGHT,
	CONNECTOR_WIDTH
} from './constants';
import { InteractionInfo, InteractionType } from './interaction';

export class Activity {
	public readonly view = new ActivityView(this);

	public readonly inputConnectors: Connector[];
	public readonly outputConnectors: Connector[];

	public position: Vector;
	public name: string;
	public label: string;
	public color: string;
	public isInvalid: boolean;
	public canDelete: boolean;
	public isSelected = false;

	public constructor(def: ActivityDefinition) {
		this.position = new Vector(def.left, def.top);
		this.name = def.name;
		this.update(def);

		this.inputConnectors = def.inputNames.map(name =>
			new Connector(this, name, ConnectorDirection.input));
		this.outputConnectors = def.outputNames.map(name =>
			new Connector(this, name, ConnectorDirection.output));
	}

	public update(def: ActivityDefinition) {
		this.label = def.label;
		this.color = def.color;
		this.isInvalid = def.isInvalid;
		this.canDelete = def.canDelete;
	}

	public deleteConnections() {
		for (const ic of this.inputConnectors) {
			ic.disconnectAndDeleteConnections();
		}
		for (const oc of this.outputConnectors) {
			oc.disconnectAndDeleteConnections();
		}
	}

	public getInputConnector(name: string): Connector {
		return getConnector(this.inputConnectors, name);
	}

	public getOutputConnector(name: string): Connector {
		return getConnector(this.outputConnectors, name);
	}

	public getDefinition(): ActivityDefinition {
		return {
			name: this.name,
			label: this.label,
			color: this.color,
			left: this.position.x,
			top: this.position.y,
			isInvalid: this.isInvalid,
			canDelete: false,
			inputNames: this.inputConnectors.map(i => i.name),
			outputNames: this.outputConnectors.map(o => o.name)
		};
	}

	public checkClick(target: Element): InteractionInfo | null {
		for (const input of this.inputConnectors) {
			if (input.view.hasElement(target)) {
				return {
					type: InteractionType.moveOutputConnection,
					connector: input
				};
			}
		}
		for (const output of this.outputConnectors) {
			if (output.view.hasElement(target)) {
				return {
					type: InteractionType.moveInputConnection,
					connector: output
				};
			}
		}
		if (this.view.hasElement(target)) {
			return {
				type: InteractionType.moveActivity,
				activity: this
			};
		}
		return null;
	}
}

class ActivityView {
	private parent: SVGElement;
	private container: SVGGElement;
	private rect: SVGRectElement;
	private label: SVGTextElement;
	private warnIconLayer: SVGGElement;

	public constructor(
		private readonly state: Activity) {
	}

	public createView(parent: SVGElement) {
		this.container = createSvgElement('g');

		this.rect = createSvgElement('rect', {
			'class': 'wfd-activity-rect',
			'rx': 3,
			'ry': 3
		});

		this.label = createSvgElement('text', {
			'class': 'wfd-activity-text',
			'text-anchor': 'middle',
			'style': 'dominant-baseline: middle;'
		});

		this.warnIconLayer = createSvgElement('path', {
			'class': 'wfd-activity-invalid-icon',
			'd': 'M16.250354835727876,10.168772928176395 l-5.056659148817744,-8.428335140644094 C10.529966431681714,0.634508051022209 9.514699966675266,0.0015702244475335192 8.406203782735133,0.0015702244475335192 s-2.123762648946581,0.6329376780620066 -2.787491904174999,1.7371572911905275 l-5.056659148817744,8.43004600658901 c-0.6722824711079767,1.119615475968061 -0.7458400534158471,2.313643818703781 -0.20100048034921159,3.2758802710006307 C0.9050367978971963,14.407746272547683 1.9673458388567155,14.960283498572835 3.2742766312026106,14.960283498572835 h10.263854303065045 c1.306930792345895,0 2.3692396847927455,-0.5525375230504892 2.9132239177073416,-1.51477382683467 C16.996193775298707,12.483272773903309 16.92263723257952,11.289243985629582 16.250354835727876,10.168772928176395 zM8.406203782735133,12.008569255459633 c-0.7304442648326415,0 -1.3257477930245898,-0.5944482437321597 -1.3257477930245898,-1.32489265707747 c0,-0.7312996235487645 0.5944482437321597,-1.3266032259970473 1.3257477930245898,-1.3266032259970473 s1.3257477930245898,0.5953035653201155 1.3257477930245898,1.3266032259970473 C9.73195202129773,11.414120566189467 9.136648493105781,12.008569255459633 8.406203782735133,12.008569255459633 zM9.802943453200896,5.658664756728626 c-0.009408533406621289,0.026514957624079738 -1.198305062060001,2.96625393041694 -1.198305062060001,2.96625393041694 c-0.03250220409874993,0.08040019213968463 -0.11119175074201237,0.133430112028865 -0.1975792125614717,0.133430112028865 s-0.16507699221914862,-0.053029915248159476 -0.1975792125614717,-0.133430112028865 l-1.1897518461804424,-2.9405942085219294 C6.94274865712714,5.485035031296093 6.9093915236067005,5.305417275056357 6.9093915236067005,5.124089246922381 c0,-0.8253849239675759 0.671427186648188,-1.496812110615764 1.496812110615764,-1.496812110615764 s1.496812110615764,0.671427186648188 1.496812110615764,1.496812110615764 C9.903016041863566,5.305417275056357 9.869658908343126,5.485035031296093 9.802943453200896,5.658664756728626 z'
		});

		this.container.appendChild(this.rect);
		this.container.appendChild(this.label);
		this.container.appendChild(this.warnIconLayer);

		this.state.inputConnectors.forEach(ic => ic.view.createView(this.container));
		this.state.outputConnectors.forEach(oc => oc.view.createView(this.container));

		this.parent = parent;
		this.parent.appendChild(this.container);
	}

	public updateView() {
		this.label.textContent = this.state.label;

		const inputsWidth = this.state.inputConnectors.length * CONNECTOR_WIDTH;
		const outputsWidth = this.state.outputConnectors.length * CONNECTOR_WIDTH;
		const labelWidth = this.label.getBBox().width;
		const labelWidthWithPadding = labelWidth + ACTIVITY_LABEL_PADDING_X;

		const rectWidth = Math.max(inputsWidth, outputsWidth, labelWidthWithPadding, ACTIVITY_MIN_WIDTH);
		const inputsOffsetX = (rectWidth - inputsWidth) / 2;
		const outputsOffsetX = (rectWidth - outputsWidth) / 2;

		const centerY = ACTIVITY_HEIGHT / 2 + CONNECTOR_HEIGHT / 2;

		setAttrs(this.rect, {
			'y': CONNECTOR_HEIGHT / 2,
			'fill': this.state.color,
			'width': rectWidth,
			'height': ACTIVITY_HEIGHT,
			'stroke': this.state.isSelected ? '#FFF' : this.state.color
		});
		setAttrs(this.label, {
			'x': rectWidth / 2,
			'y': centerY
		});
		if (this.state.isInvalid) {
			const warnIconX = (rectWidth - labelWidth) / 4;
			setAttrs(this.warnIconLayer, {
				'transform': `translate(${warnIconX - ACTIVITY_INVALID_ICON_WIDTH / 2}, ${centerY - ACTIVITY_INVALID_ICON_HEIGHT / 2})`,
				'visibility': 'visible'
			});
		} else {
			setAttrs(this.warnIconLayer, {
				'visibility': 'collapse'
			});
		}

		for (let i = 0; i < this.state.inputConnectors.length; i++) {
			this.state.inputConnectors[i].position = new Vector(CONNECTOR_WIDTH * i + inputsOffsetX, 0);
			this.state.inputConnectors[i].view.updateView();
		}
		for (let o = 0; o < this.state.outputConnectors.length; o++) {
			this.state.outputConnectors[o].position = new Vector(CONNECTOR_WIDTH * o + outputsOffsetX, ACTIVITY_HEIGHT);
			this.state.outputConnectors[o].view.updateView();
		}
		this.updatePostionOfView();
	}

	public updatePostionOfView() {
		this.container.setAttribute('transform', `translate(${this.state.position.x}, ${this.state.position.y})`);
	}

	public updateConnectionViews() {
		this.state.inputConnectors.forEach(i => i.view.updateConnectionViews());
		this.state.outputConnectors.forEach(o => o.view.updateConnectionViews());
	}

	public deleteView() {
		this.parent.removeChild(this.container);
	}

	public deleteConnectionViews() {
		this.state.inputConnectors.forEach(i => i.view.deleteConnectionViews());
		this.state.outputConnectors.forEach(o => o.view.deleteConnectionViews());
	}

	public hasElement(target: Element): boolean {
		return isChildOf(this.container, target);
	}
}

function getConnector(connectors: Connector[], name: string): Connector {
	const connector = tryFind(connectors, c => c.name === name);
	if (!connector) {
		throw new Error(`Cannot find ${name} connector.`);
	}
	return connector;
}
