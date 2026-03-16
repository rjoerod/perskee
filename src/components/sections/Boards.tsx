import { UniqueIdentifier } from '@dnd-kit/core'
import Skeleton from 'react-loading-skeleton'
import { Board } from '../../util/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../util/db'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'
import styles from './Boards.module.scss'

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

    return (
        <div
            className={[
                styles.boardList,
                currentBoardId == 2 ? styles.boardListGrow : styles.boardListBordered,
            ].join(' ')}
        >
            {data?.boards ? (
                data.boards.map((board: Board) => {
                    return (
                        <div
                            key={board.id}
                            className={[
                                styles.boardItem,
                                currentBoardId == board.id
                                    ? styles.boardItemActive
                                    : styles.boardItemInactive,
                            ].join(' ')}
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
                    containerClassName={styles.skeletonContainer}
                    inline
                    height={60}
                    borderRadius={8}
                    className={styles.boardItem}
                    count={2}
                />
            )}
        </div>
    )
}

export default Boards
