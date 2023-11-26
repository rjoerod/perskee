import { useEffect, useRef, useState } from "react";
import { idiotsAtHeadlessUI } from "../../util/util";

interface SingleInputProps {
	initialValue: string;
	handleSubmit: ((inputValue: string) => Promise<void>) | (() => void);
}

const SingleInput = ({ initialValue, handleSubmit }: SingleInputProps) => {
	const [inputValue, setInputValue] = useState(initialValue);

	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = async (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event?.target as Node)
			) {
				await handleSubmit(inputValue);
			}
		};

		// Bind the event listener
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [inputValue, handleSubmit]);

	return (
		<div ref={wrapperRef}>
			<input
				autoFocus
				name="name"
				className="w-full py-1 px-2 border-gray-400 border-2 bg-gray-900 rounded"
				value={inputValue}
				onChange={(e) => {
					setInputValue(e.target.value);
				}}
				onKeyDown={async (e) => {
					idiotsAtHeadlessUI(e);

					if (e.key === "Enter") {
						await handleSubmit(inputValue);
					}
				}}
			/>
		</div>
	);
};

export default SingleInput;
