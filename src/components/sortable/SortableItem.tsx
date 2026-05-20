import type { FC } from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Skeleton from 'react-loading-skeleton'
import { useSearchParams } from 'react-router-dom'
import { Task, TaskI } from '../../util/types'
import { route } from '../../util/queryRouting'
import { db } from '../../util/db'
import { IS_HIGHLIGHTED_TASK_COLUMN, LAST_CHANGED_COLUMN, TASK_EPIC } from '../../util/properties'
import { useLiveQuery } from 'dexie-react-hooks'
import ToastMessage from '../util/ToastMessage'
import styles from './SortableItem.module.scss'

const KNOWN_STORY_POINTS = new Set([1, 2, 3, 5, 8])

const StoryPointsBadge = ({ points }: { points: number }) => {
    const pts = KNOWN_STORY_POINTS.has(points) ? String(points) : undefined
    return (
        <div className={styles.spOuter} data-points={pts}>
            <div className={styles.spInner} data-points={pts}>P</div>
            <div>{points}</div>
        </div>
    )
}

const useEpicTasks = (epic: TaskI) => {
    const tasks = useLiveQuery(async () => {
        const tasks = (await db.tasks
            .where(TASK_EPIC)
            .equals(Number(epic.id))
            .toArray()) as Task[]
        return Promise.all(
            tasks.map((task) => {
                return task.loadListName()
            })
        )
    }, [epic.id])

    if (!epic.is_epic) {
        return null
    }

    const epicInfo = tasks?.reduce(
        (prev: { completed: number; total: number }, curr) => {
            const addTotal = Number(curr.story_points)
            const addCompleted = curr.list_name == 'Done' ? Number(addTotal) : 0

            return {
                completed: prev.completed + addCompleted,
                total: prev.total + addTotal,
            }
        },
        { completed: 0, total: 0 }
    )

    return epicInfo
}

const TaskBadges: FC<{
    item: TaskI
}> = ({ item }) => {
    const epicInfo = useEpicTasks(item)

    if (item.is_epic) {
        if (epicInfo) {
            const percentage = (epicInfo.completed / epicInfo.total) * 100
            const dataLabel =
                epicInfo.total == 0
                    ? 'No Tasks'
                    : `${epicInfo.completed} / ${epicInfo.total}`

            return (
                <div
                    className={epicInfo.total == 0 ? styles.progressBarNoTasks : styles.progressBarActive}
                    data-label={dataLabel}
                >
                    <div
                        className={styles.progressFill}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )
        }

        return (
            <div className={styles.skeletonWrap}>
                <Skeleton
                    className={styles.progressBar}
                    baseColor="rgb(100 116 139)"
                    highlightColor=" rgb(71 85 105)"
                    width={252}
                    height={20}
                    borderRadius={8}
                    inline
                />
            </div>
        )
    }

    const epicClassName = item.epic?.is_highlighted
        ? styles.epicBadgeHighlighted
        : styles.epicBadgeDefault

    return (
        <>
            {item.epic && <div className={epicClassName}>{item.epic.name}</div>}
            <StoryPointsBadge points={Number(item.story_points)} />
        </>
    )
}

export const Item: FC<{
    item: TaskI
    activeId?: UniqueIdentifier | null
    isOverlay?: boolean
    setDeleteItem?: React.Dispatch<React.SetStateAction<TaskI | null>>
}> = ({ item, activeId, isOverlay = false, setDeleteItem }) => {
    const [_, setSearchParams] = useSearchParams()

    const handleClick = (e: {
        nativeEvent: { button: number }
        preventDefault: () => void
    }) => {
        if (e.nativeEvent.button === 0) {
            route(setSearchParams, 'task_id', Number(item.id))
        } else if (e.nativeEvent.button === 2) {
            e.preventDefault()
            if (setDeleteItem) {
                setDeleteItem(item)
            }
        }
    }

    const onHighlightTaskConfirm = async (e: {
        nativeEvent: { button: number }
        preventDefault: () => void
    }) => {
        if (e.nativeEvent.button !== 1) return
        e.preventDefault()
        try {
            await db.tasks.update(Number(item.id), {
                [IS_HIGHLIGHTED_TASK_COLUMN]: !item.is_highlighted_task,
                [LAST_CHANGED_COLUMN]: new Date().toISOString(),
            })
        } catch (e) {
            ToastMessage('Failed to update highlight task')
        }
    }

    const isShowing = activeId == item.id && !isOverlay
    const cardClass = item.is_highlighted_task
        ? styles.cardHighlighted
        : styles.cardDefault

    return (
        <div
            className={cardClass}
            onClick={handleClick}
            onContextMenu={handleClick}
            onAuxClick={onHighlightTaskConfirm}
        >
            <div className={`${styles.cardText} ${isShowing ? styles.invisible : ''}`}>
                {item.name}
            </div>
            <div className={`${styles.cardBadges} ${isShowing ? styles.invisible : ''}`}>
                <TaskBadges item={item} />
            </div>
        </div>
    )
}

const SortableItem: FC<{
    item: TaskI
    activeId: UniqueIdentifier | null
    setDeleteItem?: React.Dispatch<React.SetStateAction<TaskI | null>>
}> = ({ item, activeId, setDeleteItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: Number(item.id), data: item })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            className={styles.sortableWrapper}
            style={style}
            {...attributes}
            {...listeners}
        >
            <Item
                item={item}
                activeId={activeId}
                setDeleteItem={setDeleteItem}
            />
        </div>
    )
}

export default SortableItem
