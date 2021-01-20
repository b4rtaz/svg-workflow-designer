import { Vector } from '../vector';
import { Action } from './action';
import { Connection } from './connection';
import { Designer } from './designer';
import { Interaction, InteractionInfo, InteractionType } from './interaction';

export class MoveConnectionAction implements Action {

	private lastTarget: Element;
	private offset: Vector;
	private connection?: Connection;

	public constructor(
		private readonly info: InteractionInfo,
		private readonly designer: Designer) {
	}

	public start(i: Interaction) {
		const position = this.info.connector.getPosition();
		this.lastTarget = i.target;
		this.offset = i.position
			.divideConst(this.designer.scale)
			.subtract(position);

		if (this.info.type === InteractionType.moveInputConnection) {
			this.info.connector.view.deleteConnectionViews();
			this.info.connector.disconnectAndDeleteConnections();
			this.connection = new Connection(this.info.connector, null, position);
		} else {
			this.connection = new Connection(null, this.info.connector, position);
		}
		this.connection.view.createView(this.designer.view.connectionsLayer);
		this.connection.view.updateView();
		this.info.connector.addConnection(this.connection);
	}

	public move(i: Interaction) {
		const pos = i.position
			.divideConst(this.designer.scale)
			.subtract(this.offset);

		this.lastTarget = i.target;
		this.connection.position = pos;
		this.connection.view.updateView();
	}

	public finish(i: Interaction) {
		const info = this.designer.checkClick(i.target || this.lastTarget);

		const expectedType = (this.info.type === InteractionType.moveOutputConnection)
			? InteractionType.moveInputConnection
			: InteractionType.moveOutputConnection;

		if (info && info.type === expectedType && info.connector.activity !== this.info.connector.activity) {
			if (this.info.type === InteractionType.moveOutputConnection) {
				info.connector.view.deleteConnectionViews();
				info.connector.disconnectAndDeleteConnections();
				this.connection.outputConnector = info.connector;
			} else {
				this.connection.inputConnector = info.connector;
			}
			info.connector.addConnection(this.connection);
			this.connection.view.updateView();
		} else {
			this.info.connector.deleteConnection(this.connection);
			this.connection.view.deleteView();
		}
	}
}
