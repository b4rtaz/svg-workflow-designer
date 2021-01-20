import { Activity } from './activity';
import { Connection } from './connection';
import { createSvgElement, isChildOf, setAttrs } from '../utils';
import { Vector } from '../vector';
import { CONNECTOR_HEIGHT, CONNECTOR_WIDTH } from './constants';

export class Connector {
	public readonly view = new ConnectorView(this);
	public readonly connections: Connection[] = [];

	public position: Vector | null = null;

	public constructor(
		public readonly activity: Activity,
		public readonly name: string,
		public readonly direction: ConnectorDirection) {
	}

	public addConnection(c: Connection) {
		this.connections.push(c);
	}

	public disconnectAndDeleteConnections() {
		for (const connection of this.connections) {
			connection.requireTwoConnectors();

			switch (this.direction) {
				case ConnectorDirection.input:
					connection.outputConnector.deleteConnection(connection);
					break;
				case ConnectorDirection.output:
					connection.inputConnector.deleteConnection(connection);
					break;
			}
		}
		this.connections.length = 0;
	}

	public deleteConnection(connection: Connection) {
		const index = this.connections.indexOf(connection);
		if (index < 0) {
			throw new Error('Cannot find connection.');
		}
		this.connections.splice(index, 1);
	}

	public getPosition(): Vector {
		if (!this.position) {
			throw new Error('This operation requires defined position.');
		}
		return this.activity.position
			.add(this.position)
			.add(new Vector(CONNECTOR_WIDTH, CONNECTOR_HEIGHT).divideConst(2));
	}
}

class ConnectorView {
	private circle: SVGCircleElement;

	public constructor(
		private readonly state: Connector) {
	}

	public createView(parent: SVGElement) {
		this.circle = createSvgElement('circle', {
			'class': 'wfd-connector',
			'visibility': 'hidden'
		});
		parent.appendChild(this.circle);
	}

	public updateView() {
		if (this.state.position) {
			const r = CONNECTOR_HEIGHT / 2;
			const offsetX = (CONNECTOR_WIDTH - r * 2) / 2;
			setAttrs(this.circle, {
				'visibility': 'visible',
				'cx': `${this.state.position.x + r + offsetX}`,
				'cy': `${this.state.position.y + r}`,
				'r': `${r}`
			});
		}
	}

	public updateConnectionViews() {
		this.state.connections.forEach(c => c.view.updateView());
	}

	public deleteConnectionViews() {
		this.state.connections.forEach(c => c.view.deleteView());
	}

	public hasElement(target: Element): boolean {
		return isChildOf(this.circle, target);
	}
}

export enum ConnectorDirection {
	input = 1,
	output = 2
}
