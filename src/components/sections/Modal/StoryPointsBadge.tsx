import { useState } from "react";
import { Task } from "../../../util/types";
import { STORY_POINT_COLUMN } from "../../../util/mysql";
import SingleInput from "../../util/SingleInput";
import ToastMessage from "../../util/ToastMessage";

function getStoryPointsClass(points: number): { outer: string; inner: string } {
	switch (points) {
		case 1:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-emerald-700 text-slate-100 hover:bg-emerald-800",
				inner: "rounded-xl px-[5px] text-emerald-700 bg-black font-black",
			};
		case 2:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-green-700 text-slate-100 hover:bg-green-800",
				inner: "rounded-xl px-[5px] text-green-700 bg-black font-black",
			};
		case 3:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-lime-700 text-slate-100 hover:bg-lime-800",
				inner: "rounded-xl px-[5px] text-lime-700 bg-black font-black",
			};
		case 5:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-yellow-700 text-slate-100 hover:bg-yellow-800",
				inner: "rounded-xl px-[5px] text-yellow-700 bg-black font-black",
			};
		case 8:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-orange-700 text-slate-100 hover:bg-orange-800",
				inner: "rounded-xl px-[5px] text-orange-700 bg-black font-black",
			};
		default:
			return {
				outer:
					"flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-emerald-700 text-slate-100 hover:bg-emerald-800",
				inner: "rounded-xl px-[5px] text-emerald-700 bg-black font-black",
			};
	}
}

interface StoryPointsBadgeProps {
	modalItem: Task;
	boardId: number;
}

const StoryPointsBadge = ({ modalItem, boardId }: StoryPointsBadgeProps) => {
	const [showLabelInput, setShowLabelInput] = useState(false);
	const storyPointsClass = getStoryPointsClass(modalItem.story_points);

	const onConfirm = async (value: string) => {
		if (!modalItem) {
			ToastMessage("Failed to find task");
			return;
		}

		if (isNaN(Number(value))) {
			ToastMessage("New value is not a number");
			return;
		}

		try {
			// TOOD: new request for local index update
			await fetch(`/api/task/put/${modalItem.id}`, {
				headers: {
					"Content-Type": "application/json",
				},
				method: "PUT",
				body: JSON.stringify({
					[STORY_POINT_COLUMN]: value,
				}),
			});
			// TODO: new request for local data
			// mutate(`/api/board/${boardId}`);
		} catch (e) {
			ToastMessage("Failed to delete list");
		} finally {
			setShowLabelInput(false);
		}
	};

	return (
		<div>
			<div onClick={() => setShowLabelInput(true)}>
				{showLabelInput ? (
					<div className="w-8">
						<SingleInput
							initialValue={String(modalItem?.story_points ?? 0)}
							handleSubmit={onConfirm}
						/>
					</div>
				) : (
					<div
						onClick={() => setShowLabelInput(true)}
						className="cursor-pointer"
					>
						<div className={storyPointsClass.outer}>
							<div className={storyPointsClass.inner}>P</div>
							<div>{modalItem.story_points}</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StoryPointsBadge;
