import { Dialog } from "@headlessui/react";
import { useState } from "react";
import ToastMessage from "../../util/ToastMessage";
import SingleInput from "../../util/SingleInput";
import EpicBadge from "./EpicBadge";
import StoryPointsBadge from "./StoryPointsBadge";
import MarkdownEditor from "./MarkdownEditor";
import EpicTaskList from "./EpicTaskList";
import EpicGenerateTasksButton from "./EpicGenerateTasksButton";
import { useSearchParams } from "react-router-dom";
import { NAME_COLUMN } from "../../../util/mysql";
import { Task } from "../../../util/types";
import Button from "../../buttons/Button";

interface TaskCardModalProps {
	boardId: number;
	modalItem: Task | null;
}

function TaskCardModal({ modalItem, boardId }: TaskCardModalProps) {
	const [showLabelInput, setShowLabelInput] = useState(false);

	// TODO: replace next navigation
	// const router = useRouter();
	// const searchParams = useSearchParams();
	// const pathname = usePathname();

	const onClose = () => {
		// TODO replace next navigation
		// route(router, searchParams, pathname ?? "", "task_id", null);
	};

	const onNameConfirm = async (value: string) => {
		if (!modalItem) {
			ToastMessage("Failed to find task");
			return;
		}

		try {
			// TODO: replace with update to local index
			await fetch(`/api/task/put/${modalItem.id}`, {
				headers: {
					"Content-Type": "application/json",
				},
				method: "PUT",
				body: JSON.stringify({
					[NAME_COLUMN]: value,
				}),
			});
			// TODO: replace with request for new data from local index
			// mutate(`/api/board/${boardId}`);
		} catch (e) {
			ToastMessage("Failed to delete list");
		} finally {
			setShowLabelInput(false);
		}
	};

	const isNotEpic = modalItem && !modalItem?.is_epic;

	return (
		<>
			<Dialog
				as="div"
				className="relative z-50"
				open={!!modalItem}
				onClose={onClose}
			>
				<div
					className={`fixed inset-0 p-8 max-h-4/5 z-10 flex justify-center overflow-y-auto ${
						modalItem && "bg-gray-950/50"
					}`}
				>
					<div className="fixed inset-0 w-screen overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4">
							<Dialog.Panel className="rounded-lg flex flex-col min-h-full bg-slate-800 text-white w-2/5 max-w-2xl min-w-[480px] py-8 px-8">
								<Dialog.Title className="text-slate-100 text-3xl mb-6 font-bold">
									{showLabelInput ? (
										<SingleInput
											initialValue={modalItem?.name ?? ""}
											handleSubmit={onNameConfirm}
										/>
									) : (
										<div onClick={() => setShowLabelInput(true)}>
											<h3>{modalItem?.name}</h3>
										</div>
									)}
								</Dialog.Title>
								<div className="flex gap-6 mb-6">
									{isNotEpic && (
										<>
											<EpicBadge modalItem={modalItem} boardId={boardId} />
											<StoryPointsBadge
												modalItem={modalItem}
												boardId={boardId}
											/>
										</>
									)}
									<div>
										<Button
											size="base"
											className="hover:underline"
											onClick={() => {
												navigator.clipboard.writeText(
													`[${modalItem?.name}](${window.location.href})`
												);
											}}
										>
											Copy Card Link
										</Button>
									</div>
									<div>
										{modalItem && Boolean(modalItem.is_epic) && (
											<EpicGenerateTasksButton
												epic={modalItem}
												boardId={boardId}
											/>
										)}
									</div>
								</div>
								<div className="text-left">
									{modalItem && (
										<MarkdownEditor modalItem={modalItem} boardId={boardId} />
									)}
								</div>

								{modalItem && Boolean(modalItem.is_epic) && (
									<EpicTaskList epic={modalItem} />
								)}
							</Dialog.Panel>
						</div>
					</div>
				</div>
			</Dialog>
		</>
	);
}

export default TaskCardModal;
