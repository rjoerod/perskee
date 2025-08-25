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
import { useSearchParams } from 'react-router-dom'

const getQueryArray = (param: string | string[] | undefined | null) => {
    if (!param) {
        return null
    }
    if (typeof param == 'string') {
        return [Number(param)]
    }
    return param.map((p) => Number(p))
}

interface AddTaskButtonProps {
    boardId: number
    listId: string
    listData: List[] | undefined
}

const AddTaskButton = ({ boardId, listId, listData }: AddTaskButtonProps) => {
    const [searchParams] = useSearchParams()
    const epic_ids = searchParams?.getAll('epic_id')
    const epicFilterIds = getQueryArray(epic_ids)

    const handleSubmit = async (name: string) => {
        const list = findListFromName(listId, listData)

        if (!list) {
            ToastMessage('Failed to find list')
            return
        }

        // Add to currently filtered epic if only on is selected
        const epicId = epicFilterIds?.length === 1 ? epicFilterIds[0] : -1

        // Add to end of list
        const maxTask = await db.tasks
            .where(TASK_LIST)
            .equals(Number(list.id))
            .reverse()
            .sortBy(SORTED_ORDER_COLUMN)

        try {
            await db.tasks.add({
                [TASK_EPIC]: epicId,
                [SORTED_ORDER_COLUMN]:
                    (maxTask?.[0]?.[SORTED_ORDER_COLUMN] ?? 0) + 1,
                [TASK_LIST]: Number(list.id),
                [NAME_COLUMN]: String(name),
                [IS_EPIC_COLUMN]: boardId == 2 ? 1 : 0,
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
