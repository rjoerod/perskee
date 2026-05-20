import * as Dialog from "@radix-ui/react-dialog";
import Button from "../buttons/Button";
import React from "react";
import styles from "./ConfirmationModal.module.scss";

interface ConfirmationModalProps {
	label: string;
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	onArchive?: () => void;
	confirmLabel?: string;
	children?: React.ReactNode;
}

function ConfirmationModal({
	label,
	open,
	onConfirm,
	onCancel,
	onArchive,
	confirmLabel = 'Confirm',
	children,
}: ConfirmationModalProps) {
	return (
		<Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
			<Dialog.Portal>
				<Dialog.Overlay className={styles.overlay}>
					<Dialog.Content className={styles.panel} aria-describedby={undefined}>
						<Dialog.Title className={styles.title}>{label}</Dialog.Title>
						{children}
						<div className={styles.actions}>
							<div className={styles.actionBtn}>
								<Button label={"Cancel"} onClick={onCancel} />
							</div>
							{onArchive && (
								<div className={styles.actionBtn}>
									<Button label={"Archive"} onClick={onArchive} />
								</div>
							)}
							<div className={styles.actionBtn}>
								<Button label={confirmLabel} onClick={onConfirm} />
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Overlay>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default ConfirmationModal;
