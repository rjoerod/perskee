import { UniqueIdentifier } from '@dnd-kit/core'
import Skeleton from 'react-loading-skeleton'
import { Board } from '../../util/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../util/db'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'

function useBoards() {
    const boards = useLiveQuery(async () => {
        return db.boards.toArray()
    })

    return {
        data: { boards: boards },
        isLoading: false,
        isError: false,
    }
}

const Boards = ({ currentBoardId }: { currentBoardId: UniqueIdentifier }) => {
    const [_, setSearchParams] = useSearchParams()

    const { data } = useBoards()

    const skeletonClassName =
        'rounded-md cursor-pointer text-lg text-white ring-1 ring-slate-700 text-center shadow-md focus:outline-hidden bg-transparent'

    return (
        <div
            className={`flex flex-col gap-6 p-8 font-semibold ${
                currentBoardId == 2 ? 'grow' : ''
            } ${currentBoardId != 2 ? 'border-b border-b-slate-700' : ''}`}
        >
            {data?.boards ? (
                data.boards.map((board: Board) => {
                    return (
                        <div
                            key={board.id}
                            className={`rounded-md cursor-pointer text-lg text-white ring-1 ring-slate-700 text-center px-5 py-4 shadow-md focus:outline-hidden  ${
                                currentBoardId == board.id
                                    ? 'bg-sky-600'
                                    : 'bg-transparent hover:bg-slate-800 hover:ring-slate-800'
                            } `}
                            onClick={() => {
                                route(
                                    setSearchParams,
                                    ['board_id', 'epic_id'],
                                    [board.id, null]
                                )
                            }}
                        >
                            {board.name}
                        </div>
                    )
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
    )
}

export default Boards
