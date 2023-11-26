import { FormEvent } from "react";
import { LIST_BOARD, SORTED_ORDER_COLUMN, NAME_COLUMN } from "../../util/mysql";
import ToastMessage from "../util/ToastMessage";
import ModalButton from "./ModalButton";

interface AddListButtonProps {
	boardId: number;
	nextSortedOrder: number;
}

const AddListButton = ({ boardId, nextSortedOrder }: AddListButtonProps) => {
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = e.currentTarget;
		const formData = new FormData(form);
		const name = formData.get("name");
		try {
			// TODO: Replace with local index update
			await fetch("/api/list/post", {
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify({
					[LIST_BOARD]: boardId,
					[SORTED_ORDER_COLUMN]: nextSortedOrder,
					[NAME_COLUMN]: String(name),
				}),
			});
			// TODO: repull new data function
			//mutate(`/api/board/${boardId}`)
		} catch (e) {
			ToastMessage("Failed to add list");
		}
	};

	return (
		<ModalButton
			initialLabel="+ Add another list"
			confirmLabel="Add list"
			placeholder="Enter list title..."
			handleSubmit={handleSubmit}
		/>
	);
};

export default AddListButton;
