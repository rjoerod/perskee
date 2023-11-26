import { UniqueIdentifier } from "@dnd-kit/core";

export interface Board {
	id: UniqueIdentifier;
	name: string;
}

export class List {
	id: UniqueIdentifier;
	board_id: number;
	sorted_order: number;
	name: string;
	tasks?: Task[];

	constructor(
		id: number,
		board_id: number,
		sorted_order: number,
		name: string
	) {
		this.id = id;
		this.board_id = board_id;
		this.sorted_order = sorted_order;
		this.name = name;

		// Define navigation properties.
		// Making them non-enumerable will prevent them from being handled by indexedDB
		// when doing put() or add().
		Object.defineProperties(this, {
			emails: { value: [], enumerable: false, writable: true },
			phones: { value: [], enumerable: false, writable: true },
		});
	}
}

export interface Task {
	id: UniqueIdentifier;
	list_id: number;
	sorted_order: number;
	name: string;
	epic_id: number;
	epic?: Task;
	is_epic: boolean;
	story_points: number;
	description: string;
	list_name?: string;
}

export interface CheckList {
	id: UniqueIdentifier;
	sorted_order: number;
	name: string;
	checked: boolean;
}
