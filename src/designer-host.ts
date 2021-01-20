import { Activity } from './components/activity';
import { Connection } from './components/connection';
import { Designer } from './components/designer';
import { EventEmitter } from './event-emitter';
import { ActivityDefinition, ConnectionDefinition } from './model';
import { animate } from './utils';
import { Vector } from './vector';

export class DesignerHost {
	private readonly designer = new Designer(this);

	public onDeleted = new EventEmitter<string>();
	public onSelected = new EventEmitter<string>();
	public onUnselected = new EventEmitter<string>();
	public onEditRequested = new EventEmitter<string>();

	public constructor(
		private readonly config: DesignerHostConfiguration) {
	}

	public setup() {
		this.designer.isReadOnly = !!this.config.isReadOnly;
		this.designer.view.createView(this.config.container, this.config.theme);

		this.onSelected.addListener(() => {
			this.designer.control.selectedActivity = this.designer.tryGetSelectedActivity();
			this.designer.control.view.updateView();
		});
		this.onUnselected.addListener(() => {
			this.designer.control.selectedActivity = null;
			this.designer.control.view.updateView();
		});
	}

	public addActivites(definitions: ActivityDefinition[]) {
		const activites = definitions.map(def => {
			const activity = new Activity(def);
			activity.view.createView(this.designer.view.activitiesLayer);
			this.designer.activities.push(activity);
			return activity;
		});
		setTimeout(() => {
			activites.forEach(a => a.view.updateView());
		});
	}

	public addConnections(definitions: ConnectionDefinition[]) {
		const connections = definitions.map(def => {
			const outputActivity = this.designer.getActivity(def.outputActivityName);
			const outputConnector = outputActivity.getOutputConnector(def.outputName);

			const inputActivity = this.designer.getActivity(def.inputActivityName);
			const inputConnector = inputActivity.getInputConnector(def.inputName);

			const connection = new Connection(outputConnector, inputConnector, null);
			outputConnector.addConnection(connection);
			inputConnector.addConnection(connection);
			connection.view.createView(this.designer.view.connectionsLayer);
			return connection;
		});
		setTimeout(() => {
			connections.forEach(c => c.view.updateView());
		});
	}

	public deleteActivity(activityName: string) {
		const activity = this.designer.getActivity(activityName);
		activity.view.deleteConnectionViews();
		activity.view.deleteView();
		activity.deleteConnections();
		const index = this.designer.activities.indexOf(activity);
		this.designer.activities.splice(index, 1);
		this.onDeleted.fire(activityName);
	}

	public getActivities(): ActivityDefinition[] {
		return this.designer.activities.map(a => a.getDefinition());
	}

	public getActivity(activityName: string): ActivityDefinition {
		return this.designer.getActivity(activityName).getDefinition();
	}

	public getConnections(): ConnectionDefinition[] {
		return this.designer.getUniqueConnections().map(c => c.getDefinition());
	}

	public selectActivity(activityName: string) {
		this.tryUnselectActivity();
		const activity = this.designer.getActivity(activityName);
		activity.isSelected = true;
		activity.view.updateView();
		this.onSelected.fire(activityName);
	}

	public setIsReadOnly(isReadOnly: boolean) {
		this.designer.isReadOnly = isReadOnly;
		this.designer.view.updateIsReadonly();
		this.designer.control.view.updateView();
	}

	public isReadOnly(): boolean {
		return this.designer.isReadOnly;
	}

	public tryUnselectActivity(): boolean {
		const selectedActivity = this.designer.tryGetSelectedActivity();
		if (selectedActivity) {
			selectedActivity.isSelected = false;
			selectedActivity.view.updateView();
			this.onUnselected.fire(selectedActivity.name);
			return true;
		}
		return false;
	}

	public updateActivity(definition: ActivityDefinition) {
		const activity = this.designer.getActivity(definition.name);
		activity.update(definition);
		activity.view.updateView();
		activity.view.updateConnectionViews();
	}

	public tryGetSelectedActivityName(): string | null {
		const activity = this.designer.tryGetSelectedActivity();
		return activity ? activity.name : null;
	}

	public getPositionForNewActivity(): { left: number, top: number } {
		const p = this.designer.scrollPosition.divideConst(-this.designer.scale);
		return {
			left: p.x,
			top: p.y
		};
	}

	public clear() {
		this.designer.getUniqueConnections().forEach(c => c.view.deleteView());
		this.designer.activities.forEach(a => a.view.deleteView());
		this.designer.activities.length = 0;
	}

	public scrollToActivity(activityName: string, duration?: number) {
		const pos = this.designer.getActivity(activityName).position
			.multiplyConst(this.designer.scale)
			.subtract(this.designer.view.getSize().divideConst(2));
		this.scrollTo(pos, duration);
	}

	public scrollToCenter(duration?: number) {
		this.scrollTo(new Vector(0, 0), duration);
	}

	private scrollTo(position: Vector, duration?: number) {
		const startScroll = this.designer.scrollPosition;
		const deltaScroll = position.add(startScroll);
		animate((percent: number) => {
			this.designer.scrollPosition = startScroll.subtract(deltaScroll.multiplyConst(percent));
			this.designer.view.updateViewPort();
		}, duration || 300);
	}
}

export interface DesignerHostConfiguration {
	container: HTMLElement;
	theme: string;
	isReadOnly?: boolean;
}
