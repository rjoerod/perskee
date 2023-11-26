import { UniqueIdentifier } from "@dnd-kit/core";
import Skeleton from "react-loading-skeleton";
import { Board } from "../../util/types";

// @ts-expect-error typing has no value
const fetcher = (...args) => fetch(...args).then((res) => res.json());

function useBoards() {
	// TODO: new data from index
	// const { data, error, isLoading } = useSWR(`/api/board/all`, fetcher)
	const data = {} as any;

	return {
		data: data,
		isLoading: false,
		isError: false,
	};
}

const Boards = ({ currentBoardId }: { currentBoardId: UniqueIdentifier }) => {
	// TODO: replace next navigation
	// const router = useRouter();
	// const searchParams = useSearchParams();
	// const pathname = usePathname();

	const { data } = useBoards();

	const skeletonClassName =
		"rounded-md cursor-pointer text-lg text-white ring-1 ring-slate-700 text-center shadow-md focus:outline-none bg-transparent";

	return (
		<div
			className={`flex flex-col gap-6 p-8 font-semibold ${
				currentBoardId == 2 ? "grow" : ""
			} ${currentBoardId != 2 ? "border-b border-b-slate-700" : ""}`}
		>
			{data?.boards ? (
				data.boards.map((board: Board) => {
					return (
						<div
							key={board.id}
							className={`rounded-md cursor-pointer text-lg text-white ring-1 ring-slate-700 text-center px-5 py-4 shadow-md focus:outline-none  ${
								currentBoardId == board.id
									? "bg-sky-600"
									: "bg-transparent hover:bg-slate-800 hover:ring-slate-800"
							} `}
							onClick={() => {
								// replace next navigation
								// route(
								// 	router,
								// 	searchParams,
								// 	pathname ?? "",
								// 	["board_id", "epic_id"],
								// 	[board.id, null]
								// );
							}}
						>
							{board.name}
						</div>
					);
				})
			) : (
				<Skeleton
					baseColor="#0f172a"
					highlightColor="#1e293b"
					containerClassName="flex flex-col gap-6"
					inline
					height={60}
					borderRadius={8}
					className={skeletonClassName}
					count={2}
				/>
			)}
		</div>
	);
};

export default Boards;
