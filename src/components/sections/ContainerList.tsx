import React, { useCallback, useState, useEffect, useRef } from 'react'
import type {
    UniqueIdentifier,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    CollisionDetection,
} from '@dnd-kit/core'
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    MeasuringStrategy,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
} from '@dnd-kit/core'
import {
    arrayMove,
    sortableKeyboardCoordinates,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import SortableContainer, { Container } from '../sortable/SortableContainer'
import { Item } from '../sortable/SortableItem'
import AddListButton from '../buttons/AddListButton'
import ToastMessage from '../util/ToastMessage'
import { TASK_LIST, SORTED_ORDER_COLUMN } from '../../util/properties'
import { Task, List, TaskI } from '../../util/types'
import { db } from '../../util/db'

function getListsWithChanges(
    prev: Record<string, TaskI[]>,
    curr: Record<string, TaskI[]>
) {
    const prevArray = Object.entries(prev)
    const currArray = Object.entries(curr)

    const changedListsBetween = currArray.filter((curr, idx) => {
        const prev =
            prevArray.find((prev) => prev[0] == curr[0]) ?? prevArray[idx]

        if (prev[1].length < curr[1].length) {
            return true
        }
    })

    const changedListsWithin = currArray.filter((curr, idx) => {
        const prev =
            prevArray.find((prev) => prev[0] == curr[0]) ?? prevArray[idx]

        if (prev[1].length !== curr[1].length) {
            return false
        }

        return curr[1].some((val, idx) => {
            const prev_val = prev[1][idx]
            return val !== prev_val
        })
    })

    return { between: changedListsBetween, within: changedListsWithin }
}

// save changes to DB
const updateTaskOrder = async (
    prev: Record<string, TaskI[]> | null,
    curr: Record<string, TaskI[]> | null,
    listData: List[],
    allItems: TaskI[],
    setUpdateParams: React.Dispatch<
        React.SetStateAction<
            {
                list: List | undefined
                tasksIds: (string | number | undefined)[]
            }[]
        >
    >
) => {
    if (!prev || !curr) {
        ToastMessage('Failed to update order')
        return
    }

    // get difference between list
    const { between, within } = getListsWithChanges(prev, curr)

    const isWithin = !!within && within.length != 0
    const changedLists = isWithin ? within : between

    const updateParams = changedLists.map((changedList) => {
        const list = listData.find((list) => {
            return changedList[0] === list.name
        })

        /**
         * Two arrays
         * - one with the unfiltered original data (A)
         * - one with filtered altered data (B)
         *
         * * We need to alter (A) based on (B)
         */

        // filter all items (A) by list id
        const filteredItems = allItems.filter((task) => {
            return task.list_id == list?.id
        })

        let currentIdx = 0
        let lastWasOtherTask = false

        /**
         * changedList[1] (B) is in sorted order
         *
         * Check if our item (A) is in (B)
         *      If so, get the next element from (B)'s order
         *      Otherwise, keep (A)'s order
         */
        const taskIds = []

        for (const task of filteredItems) {
            const otherTask = changedList[1].find(
                (changedTask) => changedTask.id == task.id
            )

            if (otherTask) {
                lastWasOtherTask = true
                const actualTask = changedList[1]?.[currentIdx]
                currentIdx++
                if (actualTask) {
                    taskIds.push(actualTask.id)
                } else {
                    taskIds.push(task.id)
                }
                continue
            }

            if (!isWithin && lastWasOtherTask) {
                lastWasOtherTask = false
                taskIds.push(changedList[1]?.[currentIdx]?.id)
            }

            taskIds.push(task.id)
        }

        while (currentIdx < changedList[1].length) {
            taskIds.push(changedList[1]?.[currentIdx]?.id)
            currentIdx++
        }

        return {
            list: list,
            tasksIds: taskIds,
        }
    })

    setUpdateParams(updateParams)
}

interface ContainerListProps {
    boardId: number
    nextSortedOrder: number
    listItems: UniqueIdentifier[]
    savedItems: Record<string, TaskI[]>
    listData: List[]
    setDeleteItem: React.Dispatch<React.SetStateAction<TaskI | null>>
    allItems: Task[]
}

function ContainerList({
    boardId,
    nextSortedOrder,
    listItems,
    savedItems,
    listData,
    setDeleteItem,
    allItems,
}: ContainerListProps) {
    // Maintain state for each container and the items they contain
    const [items, setItems] = useState<Record<string, TaskI[]>>(savedItems)
    const [sortedListItems, setSortedListItems] = useState(listItems)
    const [updateParams, setUpdateParams] = useState<
        {
            list: List | undefined
            tasksIds: (string | number | undefined)[]
        }[]
    >([])

    // Use the defined sensors for drag and drop operation
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                // Require mouse to move 5px to start dragging, this allow onClick to be triggered on click
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                // Require mouse to move 5px to start dragging, this allow onClick to be triggered on click
                tolerance: 5,
                // Require to press for 100ms to start dragging, this can reduce the chance of dragging accidentally due to page scroll
                delay: 100,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // State to keep track of currently active (being dragged) item
    const [active, setActive] = useState<TaskI | null>(null)

    // Ref to store the ID of the last container that was hovered over during a drag
    const lastOverId = useRef<UniqueIdentifier | null>(null)

    // Ref to track if an item was just moved to a new container
    const recentlyMovedToNewContainer = useRef(false)

    // Function to find which container an item belongs to
    const findContainer = useCallback(
        (id: UniqueIdentifier) => {
            // if the id is a container id itself
            if (id in items) return id

            // find the container by looking into each of them
            return Object.keys(items).find((key) => {
                return items[key].find((item) => {
                    return item.id == id
                })
            })
        },
        [items]
    )

    // Ref to store the state of items before a drag operation begins
    const itemsBeforeDrag = useRef<null | Record<string, TaskI[]>>(null)

    const handleDragStart = useCallback(
        ({ active }: DragStartEvent) => {
            // Store the current state of items
            itemsBeforeDrag.current = { ...items }
            // Set the active (dragged) item id
            setActive({
                ...(active?.data?.current as TaskI),
                id: active.id,
            })
        },
        [items]
    )

    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            if (!over || active.id in items) {
                return
            }

            const { id: activeId } = active
            const { id: overId } = over

            const activeContainer = findContainer(activeId)
            const overContainer = findContainer(overId)

            if (!overContainer || !activeContainer) {
                return
            }

            // Re-order tasks between lists
            if (activeContainer !== overContainer) {
                setItems((items) => {
                    const activeItems = items[activeContainer]
                    const overItems = items[overContainer]
                    const overIndex = overItems.findIndex((item) => {
                        return item.id == overId
                    })
                    const activeIndex = activeItems.findIndex((item) => {
                        return item.id == activeId
                    })

                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                            over.rect.top + over.rect.height

                    const modifier = isBelowOverItem ? 1 : 0

                    const newIndex =
                        overIndex >= 0
                            ? overIndex + modifier
                            : overItems.length + 1

                    recentlyMovedToNewContainer.current = true

                    return {
                        ...items,
                        [activeContainer]: items[activeContainer].filter(
                            (item) => item.id !== active.id
                        ),
                        [overContainer]: [
                            ...items[overContainer].slice(0, newIndex),
                            items[activeContainer][activeIndex],
                            ...items[overContainer].slice(
                                newIndex,
                                items[overContainer].length
                            ),
                        ],
                    }
                })
            }
        },
        [items, findContainer]
    )

    const handleDragEnd = useCallback(
        async ({ active, over }: DragEndEvent) => {
            // Order List
            if (
                active?.data?.current?.sortable.containerId ===
                'list-sorting-context'
            ) {
                const newSortedListItems = arrayMove(
                    sortedListItems,
                    active?.data?.current?.sortable?.index,
                    over?.data?.current?.sortable?.index
                )
                setSortedListItems(newSortedListItems)

                // save changes to DB
                const differenceItems = newSortedListItems
                    .map((val, index) => {
                        return {
                            curr: val,
                            prev: sortedListItems[index],
                            newSortedOrder: index,
                        }
                    })
                    .filter((val) => {
                        return val.prev != val.curr
                    })

                const differenceNames = differenceItems.map((val) => {
                    return val.curr
                })

                const differenceMapArray = differenceItems.map((val) => {
                    return [val.curr, val.newSortedOrder]
                })
                const differenceMap = Object.fromEntries(differenceMapArray)

                const filteredListData = listData.filter((data) => {
                    return differenceNames.includes(data.name)
                })

                // replace with new update to local data
                const updateMap = filteredListData.map(async (data) => {
                    const newSortedOrder = differenceMap[data.name]
                    await fetch(`/api/list/put/${data.id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        method: 'PUT',
                        body: JSON.stringify({
                            [SORTED_ORDER_COLUMN]: newSortedOrder,
                        }),
                    })
                })

                await Promise.all(updateMap)
            }

            // Order Tasks within lists
            const activeContainer = findContainer(active.id)
            if (!over || !activeContainer) {
                setActive(null)
                return
            }

            const { id: activeId } = active
            const { id: overId } = over

            const overContainer = findContainer(overId)

            if (!overContainer) {
                setActive(null)
                return
            }

            const activeIndex = items[activeContainer].findIndex((item) => {
                return item.id == activeId
            })
            const overIndex = items[overContainer].findIndex((item) => {
                return item.id == overId
            })

            if (activeIndex !== overIndex) {
                const newItems = {
                    ...items,
                    [overContainer]: arrayMove(
                        items[overContainer],
                        activeIndex,
                        overIndex
                    ),
                }
                setItems(newItems)

                updateTaskOrder(
                    itemsBeforeDrag.current,
                    newItems,
                    listData,
                    allItems,
                    setUpdateParams
                )
            } else {
                updateTaskOrder(
                    itemsBeforeDrag.current,
                    items,
                    listData,
                    allItems,
                    setUpdateParams
                )
            }

            setActive(null)
        },
        [sortedListItems, items, findContainer, boardId, listData, allItems]
    )

    /**
     * Custom collision detection strategy optimized for multiple containers
     * - First, find any droppable containers intersecting with the pointer.
     * - If there are none, find intersecting containers with the active draggable.
     * - If there are no intersecting containers, return the last matched intersection
     */
    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (active && Number(active.id) in items) {
                return closestCenter({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) => container.id in items
                    ),
                })
            }

            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args)
            const intersections =
                pointerIntersections.length > 0
                    ? // If there are droppables intersecting with the pointer, return those
                      pointerIntersections
                    : rectIntersection(args)
            let overId = getFirstCollision(intersections, 'id')

            if (overId != null) {
                if (overId in items) {
                    const containerItems = items[overId]

                    // If a container is matched and it contains items (columns 'A', 'B', 'C')
                    if (containerItems.length > 0) {
                        // Return the closest droppable within that container
                        overId = closestCenter({
                            ...args,
                            droppableContainers:
                                args.droppableContainers.filter(
                                    (container) =>
                                        container.id !== overId &&
                                        containerItems.some((item) => {
                                            return item.id == container.id
                                        })
                                ),
                        })[0]?.id
                    }
                }

                lastOverId.current = overId

                return [{ id: overId }]
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = active?.id ?? null
            }

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : []
        },
        [active, items]
    )

    // useEffect hook called after a drag operation, to clear the "just moved" status
    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false
        })
    }, [items])

    useEffect(() => {
        setItems(savedItems)
        setSortedListItems(listItems)
    }, [listItems, savedItems])

    useEffect(() => {
        if (!updateParams || updateParams.length === 0) {
            return
        }

        updateParams.map(async (data) => {
            if (!data?.list?.id) {
                ToastMessage('Failed to find list to update')
                return
            }
            Promise.all(
                data.tasksIds.map((id, idx) => {
                    return db.tasks.update(Number(id), {
                        [TASK_LIST]: Number(data?.list?.id),
                        [SORTED_ORDER_COLUMN]: idx + 1,
                    })
                })
            ).then(() => {})
        })
    }, [updateParams])

    const activeId = active?.id ?? null

    const activeContainer =
        activeId && sortedListItems.includes(activeId)
            ? sortedListItems.find((listItem) => activeId === listItem)
            : null

    return (
        <DndContext
            id="unique-dnd-context-id"
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
                droppable: {
                    strategy: MeasuringStrategy.Always,
                },
            }}
        >
            <SortableContext
                items={sortedListItems}
                strategy={horizontalListSortingStrategy}
                id={'list-sorting-context'}
            >
                {sortedListItems.map((listItemName) => {
                    const containerItems = items[listItemName]
                    return (
                        <SortableContainer
                            key={listItemName}
                            id={String(listItemName)}
                            activeId={activeId}
                            boardId={boardId}
                            items={containerItems}
                            listData={listData}
                            setDeleteItem={setDeleteItem}
                        />
                    )
                })}
            </SortableContext>

            {/* Use CSS.Translate.toString(transform) in `Item` style if overlay is disabled */}
            <DragOverlay>
                {activeContainer ? (
                    <Container
                        key={activeContainer}
                        id={String(activeContainer)}
                        activeId={activeId}
                        boardId={boardId}
                        items={items[activeContainer]}
                        isOverlay
                    />
                ) : active ? (
                    <Item item={active} activeId={activeId} isOverlay />
                ) : null}
            </DragOverlay>

            <div className="w-72">
                <div className="w-72">
                    <AddListButton
                        boardId={boardId}
                        nextSortedOrder={nextSortedOrder}
                    />
                </div>
            </div>
        </DndContext>
    )
}

export default ContainerList
