import { FormEvent } from "react";
import {
	NAME_COLUMN,
	TASK_LIST,
	IS_EPIC_COLUMN,
	DESCRIPTION_COLUMN,
	STORY_POINT_COLUMN,
} from "../../util/mysql";
import ToastMessage from "../util/ToastMessage";
import ModalButton from "./ModalButton";
import { List } from "../../util/types";
import { findListFromName } from "../../util/util";

interface AddTaskButtonProps {
	boardId: number;
	listId: string;
	listData: List[] | undefined;
}

const AddTaskButton = ({ boardId, listId, listData }: AddTaskButtonProps) => {
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const list = findListFromName(listId, listData);

		if (!list) {
			ToastMessage("Failed to find list");
			return;
		}

		const form = e.currentTarget;
		const formData = new FormData(form);
		const name = formData.get("name");
		try {
			await fetch("/api/task/post", {
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify({
					[TASK_LIST]: list.id,
					[NAME_COLUMN]: String(name),
					[IS_EPIC_COLUMN]: boardId == 2,
					[STORY_POINT_COLUMN]: 0,
					[DESCRIPTION_COLUMN]: "",
				}),
			});
			// TODO: replace with pulling new board data
			//mutate(`/api/board/${boardId}`)
			if (boardId == 2) {
				// TODO: replace with pulling new epics
				//mutate(`/api/task/get/epics`)
			}
		} catch (e) {
			ToastMessage("Failed to add task");
		}
	};

	return (
		<ModalButton
			initialLabel="+ Add another task"
			confirmLabel="Add task"
			placeholder="Enter task title..."
			handleSubmit={handleSubmit}
		/>
	);
};

export default AddTaskButton;
