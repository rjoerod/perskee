import { Dialog } from "@headlessui/react";
import Button from "../buttons/Button";
import React from "react";

interface ConfirmationModalProps {
	label: string;
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	children?: React.ReactNode;
}

function ConfirmationModal({
	label,
	open,
	onConfirm,
	onCancel,
	children,
}: ConfirmationModalProps) {
	return (
		<Dialog
			as="div"
			className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto ${
				open && "bg-gray-900/50"
			}`}
			open={open}
			onClose={onCancel}
		>
			<Dialog.Panel className="rounded-lg flex flex-col bg-gray-800 text-white w-96 py-8 px-4 text-center">
				<Dialog.Title className="text-red-500 text-3xl">{label}</Dialog.Title>
				{children}
				<div className="flex gap-8 pt-8">
					<div className="w-1/2">
						<Button label={"Cancel"} onClick={onCancel} />
					</div>
					<div className="w-1/2">
						<Button label={"Confirm"} onClick={onConfirm} />
					</div>
				</div>
			</Dialog.Panel>
		</Dialog>
	);
}

export default ConfirmationModal;
