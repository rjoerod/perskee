import { useEffect, useState } from 'react'
import TaskCardModal from './sections/Modal/TaskCardModal'
import ContainerList from './sections/ContainerList'
import Boards from './sections/Boards'
import { UniqueIdentifier } from '@dnd-kit/core'
import Filters from './sections/Filters'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ToastMessage from './util/ToastMessage'
import ConfirmationModal from './util/ConfirmationModal'
import Skeleton from 'react-loading-skeleton'
import { useSearchParams } from 'react-router-dom'
import { Task, List, TaskI } from '../util/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../util/db'
import { IS_ARCHIVED_COLUMN, LAST_CHANGED_COLUMN, LIST_BOARD } from '../util/properties'
import DropZone from './util/DropZone'
import TaskFilters from './sections/TaskFilters'
import TaskFiltersModal from './util/TaskFiltersModal'
import ArchiveSettingsModal from './util/ArchiveSettingsModal'
import styles from './Board.module.scss'

const checkEpicFilter = (epicIds: number[], taskEpicId: number) => {
    if (epicIds.length == 0) {
        return true
    }

    return epicIds.some((epicId) => taskEpicId == epicId)
}

const checkTitleFilter = (task: Task, title: string) => {
    return task.name.toLowerCase().includes(title.toLowerCase())
}

const checkDescriptionFilter = (task: Task, description: string) => {
    return (task.description ?? '')
        .toLowerCase()
        .includes(description.toLowerCase())
}

const checkHighlightedFilter = (task: Task, highlighted: number) => {
    if (!highlighted) return true

    return task.is_highlighted_task
}

const checkArchivedFilter = (task: Task, showArchived: number) => {
    if (showArchived) return true
    return !task.is_archived
}

const getQueryNum = (param: string | string[] | undefined | null) => {
    if (!param) {
        return null
    }
    return Number(param)
}

const getQueryArray = (param: string | string[] | undefined | null) => {
    if (!param) {
        return null
    }
    if (typeof param == 'string') {
        return [Number(param)]
    }
    return param.map((p) => Number(p))
}

function useBoard(id: UniqueIdentifier) {
    const lists = useLiveQuery(async () => {
        const lists = await db.lists.toArray()
        return Promise.all(
            lists.map((list) => {
                return list.loadTasks()
            })
        )
    }, [])

    const filteredLists = lists?.filter((list) => {
        return list?.[LIST_BOARD] === id
    })

    return { list: (filteredLists ?? []) as List[] }
}

const Board = () => {
    const [filtersModalIsOpen, setFilterModalIsOpen] = useState(false)
    const [archiveSettingsModalIsOpen, setArchiveSettingsModalIsOpen] =
        useState(false)

    const [deleteItem, setDeleteItem] = useState<TaskI | null>(null)
    const [searchParams] = useSearchParams()

    const epic_ids = searchParams?.getAll('epic_id')
    const board_id = searchParams?.get('board_id')
    const task_id = searchParams?.get('task_id')
    const title = searchParams?.get('title') ?? ''
    const description = searchParams?.get('description') ?? ''
    const highlightedTask = Number(searchParams?.get('highlighted')) ?? 0
    const showArchived = Number(searchParams?.get('show_archived')) ?? 0

    const epicFilterIds = getQueryArray(epic_ids)
    const currentBoardId = getQueryNum(board_id) ?? 1
    const modalItemId = getQueryNum(task_id)

    const data = useBoard(currentBoardId)

    useEffect(() => {
        document.body.onmousedown = (e) => {
            if (e.button === 1) return false
        }
    }, [])

    useEffect(() => {
        const runAutoArchive = async () => {
            const settings = await db.settings.get(1)
            if (!settings?.auto_archive_enabled) return

            const { archive_after_value, archive_after_unit } = settings
            const cutoff = new Date()
            switch (archive_after_unit) {
                case 'days':
                    cutoff.setDate(cutoff.getDate() - archive_after_value)
                    break
                case 'weeks':
                    cutoff.setDate(cutoff.getDate() - archive_after_value * 7)
                    break
                case 'months':
                    cutoff.setMonth(cutoff.getMonth() - archive_after_value)
                    break
                case 'years':
                    cutoff.setFullYear(
                        cutoff.getFullYear() - archive_after_value
                    )
                    break
            }
            const cutoffIso = cutoff.toISOString()

            const toArchive = await db.tasks
                .filter(
                    (task) =>
                        !task.is_epic &&
                        !task.is_archived &&
                        !!task.last_changed &&
                        task.last_changed < cutoffIso
                )
                .toArray()

            await Promise.all(
                toArchive.map((task) =>
                    db.tasks.update(Number(task.id), {
                        [IS_ARCHIVED_COLUMN]: 1,
                    })
                )
            )
        }

        runAutoArchive()
    }, [])

    const listItems = data?.list?.map((myList: List) => {
        return myList.name
    })

    const nextSortedOrder =
        data?.list?.reduce((prev: number, myList: List) => {
            return prev > myList.sorted_order ? prev : myList.sorted_order
        }, 0) + 1

    const itemsArray = data?.list?.map((myList: List) => {
        return [
            myList.name,
            myList.tasks?.filter((task) => {
                if (
                    (checkEpicFilter(epicFilterIds ?? [], task.epic_id) ||
                        currentBoardId == 2) &&
                    checkTitleFilter(task, title) &&
                    checkDescriptionFilter(task, description) &&
                    checkHighlightedFilter(task, highlightedTask) &&
                    checkArchivedFilter(task, showArchived)
                ) {
                    return task
                }
            }),
        ]
    })

    const allItems = data?.list
        ?.map((myList: List) => {
            return myList.tasks?.filter((task) => {
                return task
            })
        })
        ?.flat() as Task[]

    const items = Object.fromEntries(itemsArray ?? [])

    const modalItem = modalItemId
        ? allItems?.find((item: Task) => {
              return item.id == modalItemId
          }) ?? null
        : null

    const onConfirmDelete = async () => {
        if (!deleteItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.delete(Number(deleteItem.id))
        } catch (e) {
            ToastMessage('Failed to delete task')
        } finally {
            setDeleteItem(null)
        }
    }

    const onArchiveItem = async () => {
        if (!deleteItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.update(Number(deleteItem.id), {
                [IS_ARCHIVED_COLUMN]: 1,
                [LAST_CHANGED_COLUMN]: new Date().toISOString(),
            })
        } catch (e) {
            ToastMessage('Failed to archive task')
        } finally {
            setDeleteItem(null)
        }
    }

    return (
        <>
            <div className={styles.layout}>
                <div className={styles.sidebar}>
                    <Boards currentBoardId={currentBoardId} />
                    {currentBoardId == 1 && (
                        <Filters epicFilterIds={epicFilterIds} />
                    )}
                    <TaskFilters
                        openModal={() => setFilterModalIsOpen(true)}
                        openArchiveModal={() =>
                            setArchiveSettingsModalIsOpen(true)
                        }
                    />
                    <DropZone />
                </div>
                <div className={styles.main}>
                    {data ? (
                        <>
                            <ContainerList
                                boardId={Number(currentBoardId)}
                                nextSortedOrder={nextSortedOrder}
                                listItems={listItems}
                                savedItems={items}
                                listData={data?.list}
                                setDeleteItem={setDeleteItem}
                                allItems={allItems}
                            />
                            <TaskCardModal modalItem={modalItem} />
                            <ConfirmationModal
                                label={`Delete "${deleteItem?.name}"?`}
                                open={!!deleteItem}
                                onCancel={() => {
                                    setDeleteItem(null)
                                }}
                                onArchive={onArchiveItem}
                                confirmLabel="Delete"
                                onConfirm={onConfirmDelete}
                            />
                            <TaskFiltersModal
                                open={filtersModalIsOpen}
                                onClose={() => setFilterModalIsOpen(false)}
                            ></TaskFiltersModal>
                            <ArchiveSettingsModal
                                open={archiveSettingsModalIsOpen}
                                onClose={() =>
                                    setArchiveSettingsModalIsOpen(false)
                                }
                            />
                        </>
                    ) : (
                        <>
                            {[10, 8, 6, 11].map((val) => {
                                return (
                                    <div
                                        key={val}
                                        className={styles.skeletonColumn}
                                    >
                                        <div className={styles.skeletonHeader}>
                                            <Skeleton
                                                className={styles.skeletonCard}
                                                width={118}
                                                height={36}
                                                count={1}
                                                inline
                                                baseColor="#0f172a"
                                                highlightColor="#1e293b"
                                            />
                                            <Skeleton
                                                className={styles.skeletonCard}
                                                width={108}
                                                height={36}
                                                count={1}
                                                inline
                                                baseColor="#0f172a"
                                                highlightColor="#1e293b"
                                            />
                                        </div>
                                        <Skeleton
                                            containerClassName={styles.skeletonCardStack}
                                            className={styles.skeletonCard}
                                            inline
                                            height={60}
                                            count={val}
                                            baseColor="#0f172a"
                                            highlightColor="#1e293b"
                                        />
                                        <Skeleton
                                            className={styles.skeletonCard}
                                            height={36}
                                            count={1}
                                            inline
                                            baseColor="#0f172a"
                                            highlightColor="#1e293b"
                                        />
                                    </div>
                                )
                            })}
                            <div>
                                <Skeleton
                                    baseColor="#0f172a"
                                    highlightColor="#1e293b"
                                    inline
                                    height={36}
                                    width={288}
                                    className={styles.skeletonAddList}
                                    borderRadius={8}
                                    count={1}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={8000}
                hideProgressBar={false}
                newestOnTop={false}
                draggable={false}
                closeOnClick
                pauseOnHover
            />
        </>
    )
}

export default Board
