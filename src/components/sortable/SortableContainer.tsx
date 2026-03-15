import { useState, type FC } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { UniqueIdentifier } from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import SortableItem, { Item } from './SortableItem'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import DropDown from '../util/DropDown'
import ToastMessage from '../util/ToastMessage'
import AddTaskButton from '../buttons/AddTaskButton'
import SingleInput from '../util/SingleInput'
import { List, TaskI } from '../../util/types'
import { NAME_COLUMN } from '../../util/properties'
import { findListFromName } from '../../util/util'
import { db } from '../../util/db'
import styles from './SortableContainer.module.css'

export const Container: FC<{
    items: TaskI[]
    id: string
    activeId: UniqueIdentifier | null
    boardId: UniqueIdentifier
    listData?: List[]
    isOverlay?: boolean
    listeners?: SyntheticListenerMap | undefined
    setDeleteItem?: React.Dispatch<React.SetStateAction<TaskI | null>>
}> = ({
    items,
    id,
    activeId,
    boardId,
    listData,
    isOverlay = false,
    listeners,
    setDeleteItem,
}) => {
    const [showLabelInput, setShowLabelInput] = useState(false)

    // This is needed for empty column to be droppable
    const { setNodeRef } = useDroppable({
        id: id,
    })

    const isBeingDragged = !isOverlay && id == activeId

    const containerClass = isBeingDragged
        ? styles.containerDragging
        : styles.containerIdle

    const dropDownItems = [
        {
            icon: 'delete',
            onClick: async () => {
                const list = findListFromName(id, listData)

                if (!list) {
                    ToastMessage('Failed to find list')
                    return
                }

                try {
                    await db.lists.delete(Number(list.id))
                } catch (e) {
                    ToastMessage('Failed to delete list')
                }
            },
        },
    ]

    return (
        <div className={containerClass} {...listeners}>
            <div
                className={`${styles.header} ${isBeingDragged ? styles.invisible : ''}`}
            >
                {showLabelInput ? (
                    <SingleInput
                        initialValue={String(id)}
                        handleSubmit={async (value: string) => {
                            if (value != String(id)) {
                                try {
                                    const list = findListFromName(id, listData)

                                    if (!list) {
                                        ToastMessage('Failed to find list')
                                        return
                                    }

                                    await db.lists.update(Number(list.id), {
                                        [NAME_COLUMN]: value,
                                    })
                                } catch (e) {
                                    ToastMessage('Failed to add list')
                                }
                            }
                            setShowLabelInput(false)
                        }}
                    />
                ) : (
                    <div onClick={() => setShowLabelInput(true)}>
                        <h1
                            className={styles.label}
                        >
                            {id}
                        </h1>
                    </div>
                )}

                <DropDown items={dropDownItems} />
            </div>
            <SortableContext
                items={items as { id: UniqueIdentifier }[]}
                strategy={verticalListSortingStrategy}
                id={id}
            >
                <div
                    className={isBeingDragged ? styles.itemsHidden : styles.itemsOverflow}
                    ref={setNodeRef}
                >
                    {items.map((item: TaskI) =>
                        isBeingDragged ? (
                            <Item
                                key={item.id}
                                item={item}
                                activeId={item.id}
                            />
                        ) : (
                            <SortableItem
                                key={item.id}
                                item={item}
                                activeId={activeId}
                                setDeleteItem={setDeleteItem}
                            />
                        )
                    )}
                </div>
            </SortableContext>
            <div
                className={`${styles.footer} ${isBeingDragged ? styles.invisible : ''}`}
            >
                <AddTaskButton
                    listId={id}
                    listData={listData}
                    boardId={Number(boardId)}
                />
            </div>
        </div>
    )
}

const SortableContainer: FC<{
    items: TaskI[]
    id: string
    boardId: UniqueIdentifier
    activeId: UniqueIdentifier | null
    listData: List[]
    setDeleteItem: React.Dispatch<React.SetStateAction<TaskI | null>>
}> = ({ items, id, boardId, activeId, listData, setDeleteItem }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={styles.sortableOuter}
        >
            <Container
                id={id}
                activeId={activeId}
                boardId={boardId}
                items={items}
                listData={listData}
                listeners={listeners}
                setDeleteItem={setDeleteItem}
            />
        </div>
    )
}

export default SortableContainer
