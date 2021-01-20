import { ConnectionDefinition } from '../model';
import { createSvgElement, setAttrs } from '../utils';
import { Vector } from '../vector';
import { Connector } from './connector';
import { CONNECTION_END_SIZE, CONNECTION_LABEL_MIN_DISTANCE, CONNECTION_STROKE_WIDTH } from './constants';

export class Connection {
	public readonly view = new ConnectionView(this);

	public constructor(
		public outputConnector: Connector | null,
		public inputConnector: Connector | null,
		public position: Vector | null) {
		if (!outputConnector && !inputConnector) {
			throw new Error('The connection must have minimum one connector.');
		}
	}

	public requireTwoConnectors() {
		if (!this.inputConnector || !this.outputConnector) {
			throw new Error('This operation requires two connectors.');
		}
	}

	public getDefinition(): ConnectionDefinition {
		this.requireTwoConnectors();
		return {
			inputActivityName: this.inputConnector.activity.name,
			inputName: this.inputConnector.name,
			outputActivityName: this.outputConnector.activity.name,
			outputName: this.outputConnector.name
		};
	}
}

class ConnectionView {
	private parent: SVGElement;
	private line: SVGLineElement;
	private circle: SVGCircleElement;
	private arrow: SVGPathElement;
	private labelRect: SVGRectElement;
	private labelText: SVGTextElement;

	private isLabelVisible = false;

	public constructor(
		private readonly state: Connection) {
	}

	public createView(parent: SVGElement) {
		this.line = createSvgElement('line', {
			'class': 'wfd-connection-line',
			'stroke-width': CONNECTION_STROKE_WIDTH
		});
		this.circle = createSvgElement('circle', {
			'class': 'wfd-connection-start',
			'r': CONNECTION_END_SIZE / 2
		});

		const triangleR = CONNECTION_END_SIZE / 3;
		const triangleA = CONNECTION_END_SIZE / Math.sqrt(3);
		this.arrow = createSvgElement('path', {
			'class': 'wfd-connection-end',
			'd': `M -${triangleA} -${triangleR} L ${triangleA} -${triangleR} L 0 ${triangleR * 2} z`
		});

		this.labelRect = createSvgElement('rect', {
			'class': 'wfd-connection-label-rect',
			'visibility': 'hidden',
			'rx': 3,
			'ry': 3
		});
		this.labelText = createSvgElement('text', {
			'class': 'wfd-connection-label-text',
			'text-anchor': 'middle',
			'style': 'dominant-baseline: middle;',
			'visibility': 'hidden'
		});
		this.labelText.textContent = 'test';

		this.parent = parent;
		this.parent.appendChild(this.line);
		this.parent.appendChild(this.circle);
		this.parent.appendChild(this.arrow);
		this.parent.appendChild(this.labelRect);
		this.parent.appendChild(this.labelText);
	}

	public deleteView() {
		this.parent.removeChild(this.line);
		this.parent.removeChild(this.circle);
		this.parent.removeChild(this.arrow);
		this.parent.removeChild(this.labelRect);
		this.parent.removeChild(this.labelText);
	}

	public updateView() {
		const o = this.state.outputConnector ? this.state.outputConnector.getPosition() : this.state.position;
		const i = this.state.inputConnector ? this.state.inputConnector.getPosition() : this.state.position;
		const angle = o.angleRad(i) - 270;

		setAttrs(this.line, {
			'x1': o.x,
			'y1': o.y,
			'x2': i.x,
			'y2': i.y
		});
		setAttrs(this.circle, {
			'cx': o.x,
			'cy': o.y
		});
		setAttrs(this.arrow, {
			'transform': `translate(${i.x}, ${i.y}) rotate(${angle})`
		});

		if (this.state.outputConnector) {
			const distance = o.distance(i);

			if (distance > CONNECTION_LABEL_MIN_DISTANCE) {
				if (!this.isLabelVisible) {
					this.labelText.innerHTML = this.state.outputConnector.name;
					setAttrs(this.labelText, {
						'visibility': 'visible'
					});
					setAttrs(this.labelRect, {
						'visibility': 'visible'
					});
					this.isLabelVisible = true;
				}
			} else if (this.isLabelVisible) {
				setAttrs(this.labelText, {
					'visibility': 'hidden'
				});
				setAttrs(this.labelRect, {
					'visibility': 'hidden'
				});
				this.isLabelVisible = false;
			}

			if (this.isLabelVisible) {
				const ax = (o.x + i.x) / 2;
				const ay = (o.y + i.y) / 2;
				setAttrs(this.labelText, {
					'x': ax,
					'y': ay
				});

				const bbox = this.labelText.getBBox();
				const rectWidth = bbox.width + 10;
				const rectHeight = bbox.height + 6;
				setAttrs(this.labelRect, {
					'width': rectWidth,
					'height': rectHeight,
					'x': ax - rectWidth / 2,
					'y': ay - rectHeight / 2
				});
			}
		}
	}
}
