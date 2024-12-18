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
import { LIST_BOARD } from '../util/properties'
import DropZone from './util/DropZone'
import TaskFilters from './sections/TaskFilters'
import TaskFiltersModal from './util/TaskFiltersModal'

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

    const [deleteItem, setDeleteItem] = useState<TaskI | null>(null)
    const [searchParams] = useSearchParams()

    const epic_ids = searchParams?.getAll('epic_id')
    const board_id = searchParams?.get('board_id')
    const task_id = searchParams?.get('task_id')
    const title = searchParams?.get('title') ?? ''
    const description = searchParams?.get('description') ?? ''
    const highlightedTask = Number(searchParams?.get('highlighted')) ?? 0

    const epicFilterIds = getQueryArray(epic_ids)
    const currentBoardId = getQueryNum(board_id) ?? 1
    const modalItemId = getQueryNum(task_id)

    const data = useBoard(currentBoardId)

    useEffect(() => {
        document.title = 'Perskee'
        document.body.onmousedown = (e) => {
            if (e.button === 1) return false
        }
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
                    checkHighlightedFilter(task, highlightedTask)
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

    return (
        <>
            <div className="grid min-h-screen w-auto grid-cols-[320px_1fr] gap-0 overflow-hidden">
                <div className="max-h-screen flex flex-col bg-slate-900 border-r border-slate-700">
                    <Boards currentBoardId={currentBoardId} />
                    {currentBoardId == 1 && (
                        <Filters epicFilterIds={epicFilterIds} />
                    )}
                    <TaskFilters openModal={() => setFilterModalIsOpen(true)} />
                    <DropZone />
                </div>
                <div
                    className={
                        'max-h-screen flex gap-4 p-8 bg-slate-900 overflow-auto'
                    }
                >
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
                                onConfirm={onConfirmDelete}
                            />
                            <TaskFiltersModal
                                open={filtersModalIsOpen}
                                onClose={() => setFilterModalIsOpen(false)}
                            ></TaskFiltersModal>
                        </>
                    ) : (
                        <>
                            {[10, 8, 6, 11].map((val) => {
                                return (
                                    <div
                                        key={val}
                                        className="flex flex-col gap-2 py-1 px-1 w-72 max-h-full h-fit bg-slate-800 rounded-lg"
                                    >
                                        <div className="flex gap-2 justify-between">
                                            <Skeleton
                                                className="flex flex-col rounded-lg content-box mr-1 box-shadow-card text-slate-300 select-none bg-slate-700"
                                                width={118}
                                                height={36}
                                                count={1}
                                                inline
                                                baseColor="#0f172a"
                                                highlightColor="#1e293b"
                                            />
                                            <Skeleton
                                                className="flex flex-col rounded-lg content-box mr-1 box-shadow-card text-slate-300 select-none bg-slate-700"
                                                width={108}
                                                height={36}
                                                count={1}
                                                inline
                                                baseColor="#0f172a"
                                                highlightColor="#1e293b"
                                            />
                                        </div>
                                        <Skeleton
                                            containerClassName="flex flex-col gap-2"
                                            className="flex flex-col rounded-lg content-box mr-1 box-shadow-card text-slate-300 select-none bg-slate-700"
                                            inline
                                            height={60}
                                            count={val}
                                            baseColor="#0f172a"
                                            highlightColor="#1e293b"
                                        />
                                        <Skeleton
                                            className="flex flex-col mb-2 rounded-lg content-box mr-1 box-shadow-card text-slate-300 select-none bg-slate-700"
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
                                    className={
                                        'py-2 px-3 h-min w-full ring-1 ring-slate-700 bg-transparent rounded-lg text-sm'
                                    }
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
