export interface ActivityDefinition {
	name: string;
	label: string;
	color: string;
	left: number;
	top: number;
	isInvalid: boolean;
	canDelete: boolean;
	inputNames: string[];
	outputNames: string[];
}

export interface ConnectionDefinition {
	outputActivityName: string;
	outputName: string;
	inputActivityName: string;
	inputName: string;
}
