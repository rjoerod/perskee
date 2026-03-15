import * as Dialog from "@radix-ui/react-dialog";
import Button from "../buttons/Button";
import React from "react";
import styles from "./ConfirmationModal.module.scss";

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
		<Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
			<Dialog.Portal>
				<Dialog.Overlay className={styles.overlay}>
					<Dialog.Content className={styles.panel}>
						<Dialog.Title className={styles.title}>{label}</Dialog.Title>
						{children}
						<div className={styles.actions}>
							<div className={styles.actionBtn}>
								<Button label={"Cancel"} onClick={onCancel} />
							</div>
							<div className={styles.actionBtn}>
								<Button label={"Confirm"} onClick={onConfirm} />
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Overlay>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default ConfirmationModal;
