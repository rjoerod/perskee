import Button from "../buttons/Button";
import { useState } from "react";

const TitleFilters = () => {
	// TODO replace next navigation
	// const router = useRouter();
	// const searchParams = useSearchParams();
	// const pathname = usePathname();

	// const titleParam = searchParams?.get("title") ?? "";
	const [title, setTitle] = useState(/* titleParam */ "");

	return (
		<div className="px-9 py-4 border-t border-t-slate-700">
			<div className="py-4 text-lg font-semibold">Filter By Title</div>
			<div className="flex flex-col grow max-h-full gap-6">
				<input
					className="w-full py-1 px-2 border-gray-400 border-2 bg-gray-900 rounded"
					onChange={(e) => {
						setTitle(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							// TODO replace next navigation
							// route(router, searchParams, pathname ?? "", "title", title);
						}
					}}
					value={title}
				/>
				<Button
					onClick={() => {
						// TODO replace next navigation
						// route(router, searchParams, pathname ?? "", "title", title);
					}}
				>
					Update
				</Button>
			</div>
		</div>
	);
};

export default TitleFilters;
