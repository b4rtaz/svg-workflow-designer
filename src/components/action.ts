import { Interaction } from './interaction';

export interface Action {
	start(i: Interaction): void;
	move(i: Interaction): void;
	finish(i: Interaction): void;
}
