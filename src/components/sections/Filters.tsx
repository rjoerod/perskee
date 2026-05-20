import { UniqueIdentifier } from '@dnd-kit/core'
import Skeleton from 'react-loading-skeleton'
import { Task } from '../../util/types'
import { useEpics } from '../../util/util'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'
import styles from './Filters.module.scss'

const Filters = ({
    epicFilterIds,
}: {
    epicFilterIds: UniqueIdentifier[] | null
}) => {
    const [_, setSearchParams] = useSearchParams()

    const data = useEpics()

    const getItemClass = (task: Task) => {
        if (epicFilterIds?.includes(Number(task.id))) return styles.filterItemActive
        if (task.is_highlighted && (task.task_count ?? 0) === 0) return styles.filterItemHighlightedNoTasks
        if (task.is_highlighted) return styles.filterItemHighlighted
        if ((task.task_count ?? 0) === 0) return styles.filterItemNoTasks
        return styles.filterItem
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Filter By Epic</div>
            <div className={styles.list}>
                {data?.tasks ? (
                    data.tasks.map((task: Task) => {
                        return (
                            <div
                                key={task.id}
                                className={getItemClass(task)}
                                onClick={() => {
                                    const newEpicId = !epicFilterIds?.includes(
                                        Number(task.id)
                                    )
                                        ? Number(task.id)
                                        : null
                                    route(
                                        setSearchParams,
                                        'epic_id',
                                        newEpicId,
                                        true,
                                        task.id
                                    )
                                }}
                            >
                                {task.name}
                            </div>
                        )
                    })
                ) : (
                    <Skeleton
                        baseColor="#0f172a"
                        highlightColor="#1e293b"
                        className={styles.filterItem}
                        count={7}
                    />
                )}
            </div>
        </div>
    )
}

export default Filters
