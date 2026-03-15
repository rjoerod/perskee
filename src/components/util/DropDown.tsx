import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { JSX, SVGProps } from "react";
import styles from "./DropDown.module.scss";

function DeleteIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="5" y="6" width="10" height="10" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
			<path d="M3 6H17" stroke="#A78BFA" strokeWidth="2" />
			<path d="M8 6V4H12V6" stroke="#A78BFA" strokeWidth="2" />
		</svg>
	);
}

function ChevronDown() {
	return (
		<svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
		</svg>
	);
}

interface DropDownItem {
	icon: string;
	onClick: () => void;
}

interface DropDownProps {
	items: DropDownItem[];
}

export default function DropDown({ items }: DropDownProps) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger className={styles.trigger}>
				Options
				<ChevronDown />
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.content} align="end" sideOffset={4}>
					{items.map((item) => (
						<DropdownMenu.Item
							key={item.icon}
							className={styles.item}
							onSelect={item.onClick}
						>
							{item.icon === "delete" && (
								<DeleteIcon className={styles.icon} aria-hidden="true" />
							)}
							Delete
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
