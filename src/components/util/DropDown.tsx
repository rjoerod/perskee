import { Menu, Transition } from "@headlessui/react";
import { Fragment, JSX, SVGProps } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function Icon({ icon, active }: { icon: string; active: boolean }) {
	if (active) {
		switch (icon) {
			case "delete":
				return (
					<DeleteActiveIcon
						className="mr-2 h-5 w-5 text-violet-400"
						aria-hidden="true"
					/>
				);
		}
	} else {
		switch (icon) {
			case "delete":
				return (
					<DeleteInactiveIcon
						className="mr-2 h-5 w-5 text-violet-400"
						aria-hidden="true"
					/>
				);
		}
	}
	return <></>;
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
		<div className="text-right">
			<Menu as="div" className="relative inline-block text-left">
				<div>
					<Menu.Button className="inline-flex w-full justify-center rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
						Options
						<ChevronDownIcon
							className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
							aria-hidden="true"
						/>
					</Menu.Button>
				</div>
				<Transition
					as={Fragment}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<Menu.Items className="absolute z-10 left-28 -mt-9 w-28 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden">
						{items.map((item) => {
							return (
								<div className="px-[2px] py-[2px]" key={item.icon}>
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={item.onClick}
												className={`${
													active ? "bg-violet-500 text-white" : "text-gray-900"
												} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
											>
												<Icon icon={item.icon} active={active} />
												Delete
											</button>
										)}
									</Menu.Item>
								</div>
							);
						})}
					</Menu.Items>
				</Transition>
			</Menu>
		</div>
	);
}

function DeleteInactiveIcon(
	props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
	return (
		<svg
			{...props}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="5"
				y="6"
				width="10"
				height="10"
				fill="#EDE9FE"
				stroke="#A78BFA"
				strokeWidth="2"
			/>
			<path d="M3 6H17" stroke="#A78BFA" strokeWidth="2" />
			<path d="M8 6V4H12V6" stroke="#A78BFA" strokeWidth="2" />
		</svg>
	);
}

function DeleteActiveIcon(
	props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
	return (
		<svg
			{...props}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="5"
				y="6"
				width="10"
				height="10"
				fill="#8B5CF6"
				stroke="#C4B5FD"
				strokeWidth="2"
			/>
			<path d="M3 6H17" stroke="#C4B5FD" strokeWidth="2" />
			<path d="M8 6V4H12V6" stroke="#C4B5FD" strokeWidth="2" />
		</svg>
	);
}
