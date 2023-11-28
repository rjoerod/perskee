import { FormEvent } from 'react'
import {
    NAME_COLUMN,
    TASK_LIST,
    IS_EPIC_COLUMN,
    DESCRIPTION_COLUMN,
    STORY_POINT_COLUMN,
    TASK_EPIC,
    SORTED_ORDER_COLUMN,
} from '../../util/properties'
import ToastMessage from '../util/ToastMessage'
import ModalButton from './ModalButton'
import { List } from '../../util/types'
import { findListFromName } from '../../util/util'
import { db } from '../../util/db'

interface AddTaskButtonProps {
    boardId: number
    listId: string
    listData: List[] | undefined
}

const AddTaskButton = ({ boardId, listId, listData }: AddTaskButtonProps) => {
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const list = findListFromName(listId, listData)

        if (!list) {
            ToastMessage('Failed to find list')
            return
        }

        const form = e.currentTarget
        const formData = new FormData(form)
        const name = formData.get('name')

        // Add to end of list
        const maxTask = await db.tasks
            .where(TASK_LIST)
            .equals(Number(list.id))
            .reverse()
            .sortBy(SORTED_ORDER_COLUMN)

        try {
            await db.tasks.add({
                [TASK_EPIC]: -1,
                [SORTED_ORDER_COLUMN]:
                    (maxTask?.[0]?.[SORTED_ORDER_COLUMN] ?? 0) + 1,
                [TASK_LIST]: Number(list.id),
                [NAME_COLUMN]: String(name),
                [IS_EPIC_COLUMN]: boardId == 2,
                [STORY_POINT_COLUMN]: 0,
                [DESCRIPTION_COLUMN]: '',
            })
        } catch (e) {
            console.error(e)
            ToastMessage('Failed to add task')
        }
    }

    return (
        <ModalButton
            initialLabel="+ Add another task"
            confirmLabel="Add task"
            placeholder="Enter task title..."
            handleSubmit={handleSubmit}
        />
    )
}

export default AddTaskButton
