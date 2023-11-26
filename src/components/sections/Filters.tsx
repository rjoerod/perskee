import { UniqueIdentifier } from "@dnd-kit/core";
import Skeleton from "react-loading-skeleton";
import { Task } from "../../util/types";
import { useEpics } from "../../util/util";

const Filters = ({
	epicFilterIds,
}: {
	epicFilterIds: UniqueIdentifier[] | null;
}) => {
	// TODO replace next navigation
	// const router = useRouter()
	// const searchParams = useSearchParams()
	// const pathname = usePathname()

	const { data } = useEpics();

	const skeletonClassName =
		"text-slate-400 border-slate-800 font-semibold pl-6 py-4 border-l-4";

	return (
		<div className="px-9 py-4">
			<div className="py-4 text-lg font-semibold">Filter By Epic</div>
			<div className="flex flex-col grow max-h-full overflow-auto pb-8 bl border-slate-800 select-none">
				{data?.tasks ? (
					data.tasks.map((task: Task) => {
						return (
							<div
								key={task.id}
								className={`${
									epicFilterIds?.includes(task.id)
										? "text-sky-500 border-sky-500"
										: "text-slate-400 hover:text-slate-300 border-slate-800"
								} font-semibold pl-6 py-4 cursor-pointer border-l-4`}
								onClick={() => {
									const newEpicId = !epicFilterIds?.includes(task.id)
										? task.id
										: null;
									// TODO replace next navigation
									// route(
									// 	router,
									// 	searchParams,
									// 	pathname ?? "",
									// 	"epic_id",
									// 	newEpicId,
									// 	true,
									// 	task.id
									// );
								}}
							>
								{task.name}
							</div>
						);
					})
				) : (
					<Skeleton
						baseColor="#0f172a"
						highlightColor="#1e293b"
						className={skeletonClassName}
						count={7}
					/>
				)}
			</div>
		</div>
	);
};

export default Filters;
