import type { FC } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Skeleton from "react-loading-skeleton";
import { useSearchParams } from "react-router-dom";
import { Task } from "../../util/types";

function getStoryPointsClass(points: number): { outer: string; inner: string } {
	switch (points) {
		case 1:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-emerald-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-emerald-700 bg-black font-black",
			};
		case 2:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-green-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-green-700 bg-black font-black",
			};
		case 3:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-lime-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-lime-700 bg-black font-black",
			};
		case 5:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-yellow-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-yellow-700 bg-black font-black",
			};
		case 8:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-orange-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-orange-700 bg-black font-black",
			};
		default:
			return {
				outer:
					"flex gap-[7px] text-xs py-[2px] pl-1 pr-2 rounded bg-emerald-700 text-slate-100",
				inner:
					"text-[8px] rounded-lg px-[5px] text-emerald-700 bg-black font-black",
			};
	}
}

const StoryPointsBadge = ({ points }: { points: number }) => {
	const storyPointsClass = getStoryPointsClass(points);

	return (
		<div className={storyPointsClass.outer}>
			<div className={storyPointsClass.inner}>P</div>
			<div>{points}</div>
		</div>
	);
};

// @ts-expect-error typing has no value
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const useEpicTasks = (epic: Task) => {
	// TODO: replace with request for index data
	// const { data } = useSWR(
	// 	epic.is_epic ? `/api/task/getByEpic/${epic.id}` : null,
	// 	fetcher
	// );
	const data = { tasks: [] as any[] };

	if (!epic.is_epic) {
		return null;
	}

	const epicInfo = data?.tasks?.reduce(
		(
			prev: { completed: number; total: number },
			curr: { story_points: number; list_name: string }
		) => {
			const addTotal = curr.story_points;
			const addCompleted = curr.list_name == "Done" ? addTotal : 0;

			return {
				completed: prev.completed + addCompleted,
				total: prev.total + addTotal,
			};
		},
		{ completed: 0, total: 0 }
	);

	return epicInfo;
};

const TaskBadges: FC<{
	item: Task;
}> = ({ item }) => {
	const epicInfo = useEpicTasks(item);

	if (item.is_epic) {
		if (epicInfo) {
			const percentage = (epicInfo.completed / epicInfo.total) * 100;
			const dataLabel =
				epicInfo.total == 0
					? "No Tasks"
					: `${epicInfo.completed} / ${epicInfo.total}`;
			const background = epicInfo.total == 0 ? "bg-slate-500" : "bg-red-800";

			return (
				<div
					className={`h-5 text-sm text-slate-100 ${background} w-full rounded-lg relative before:w-full before:content-[attr(data-label)] before:text-center before:absolute`}
					data-label={dataLabel}
				>
					<div
						className={`h-full text-left inline-block bg-green-800 rounded-lg`}
						style={{ width: `${percentage}%` }}
					/>
				</div>
			);
		}

		return (
			<div className="-mt-[6px]">
				<Skeleton
					className={`text-sm bg-slate-600 w-full rounded-lg relative`}
					baseColor="rgb(100 116 139)"
					highlightColor=" rgb(71 85 105)"
					width={252}
					height={20}
					borderRadius={8}
					inline
				/>
			</div>
		);
	}

	const epicClassName =
		"text-xs py-[2px] px-2 rounded text-slate-100 bg-sky-600";

	return (
		<>
			{item.epic && <div className={epicClassName}>{item.epic.name}</div>}
			<StoryPointsBadge points={item.story_points} />
		</>
	);
};

export const Item: FC<{
	item: Task;
	activeId?: UniqueIdentifier | null;
	isOverlay?: boolean;
	setDeleteItem?: React.Dispatch<React.SetStateAction<Task | null>>;
}> = ({ item, activeId, isOverlay = false, setDeleteItem }) => {
	// TODO replace next navigation
	// const router = useRouter();
	const searchParams = useSearchParams();
	// const pathname = usePathname();

	const handleClick = (e: {
		nativeEvent: { button: number };
		preventDefault: () => void;
	}) => {
		if (e.nativeEvent.button === 0) {
			// TODO replace next navigation
			// route(router, searchParams, pathname ?? "", "task_id", item.id);
		} else if (e.nativeEvent.button === 2) {
			e.preventDefault();
			if (setDeleteItem) {
				setDeleteItem(item);
			}
		}
	};

	const isShowing = activeId == item.id && !isOverlay;

	const className =
		"flex flex-col mb-2 rounded-lg content-box mr-1 pt-2 pr-2 pb-2 pl-3 box-shadow-card text-slate-300 cursor-pointer select-none bg-slate-700 hover:bg-gray-500";

	return (
		<div
			className={className}
			onClick={handleClick}
			onContextMenu={handleClick}
		>
			<div className={`text-sm ${isShowing && "invisible"}`}>{item.name}</div>
			<div className={`flex gap-2 mt-1 ${isShowing && "invisible"}`}>
				<TaskBadges item={item} />
			</div>
		</div>
	);
};

const SortableItem: FC<{
	item: Task;
	activeId: UniqueIdentifier | null;
	setDeleteItem?: React.Dispatch<React.SetStateAction<Task | null>>;
}> = ({ item, activeId, setDeleteItem }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: item.id, data: item });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			className="last:-mb-2"
			style={style}
			{...attributes}
			{...listeners}
		>
			<Item item={item} activeId={activeId} setDeleteItem={setDeleteItem} />
		</div>
	);
};

export default SortableItem;
