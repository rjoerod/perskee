import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "../buttons/Button";
import { idiotsAtHeadlessUI } from "../../util/util";

interface ModalButtonProps {
	initialLabel: string;
	confirmLabel: string;
	placeholder: string;
	handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

const ModalButton = ({
	initialLabel,
	confirmLabel,
	placeholder,
	handleSubmit,
}: ModalButtonProps) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [isActive, setIsActive] = useState(false);

	const handleClickOutside = (event: MouseEvent) => {
		if (
			wrapperRef.current &&
			!wrapperRef.current.contains(event?.target as Node)
		) {
			setIsActive(false);
		}
	};

	useEffect(() => {
		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="h-min" ref={wrapperRef}>
			{isActive ? (
				<form
					onSubmit={async (e) => {
						await handleSubmit(e);
						setIsActive(false);
					}}
					className="py-3 px-3 h-min bg-slate-800 rounded-lg text-sm"
				>
					<input
						name="name"
						className="py-1 px-2 mb-4 border-gray-400 border-2 bg-gray-900 rounded w-full"
						placeholder={placeholder}
						onKeyDown={idiotsAtHeadlessUI}
					/>
					<div className="flex gap-3">
						<Button type="submit" label={confirmLabel} />
						<Button
							label="Cancel"
							onClick={() => {
								setIsActive(false);
							}}
						/>
					</div>
				</form>
			) : (
				<Button label={initialLabel} onClick={() => setIsActive(true)} />
			)}
		</div>
	);
};

export default ModalButton;
