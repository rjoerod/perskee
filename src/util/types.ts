import { UniqueIdentifier } from '@dnd-kit/core'
import { db } from './db'
import { ID, TASK_EPIC, TASK_LIST } from './mysql'

export interface Board {
    id: UniqueIdentifier
    name: string
}

export class List {
    id: UniqueIdentifier
    board_id: number
    sorted_order: number
    name: string
    tasks?: Task[]

    constructor(
        id: number,
        board_id: number,
        sorted_order: number,
        name: string
    ) {
        this.id = id
        this.board_id = board_id
        this.sorted_order = sorted_order
        this.name = name

        // Define navigation properties.
        // Making them non-enumerable will prevent them from being handled by indexedDB
        // when doing put() or add().
        Object.defineProperties(this, {
            tasks: { value: [], enumerable: false, writable: true },
        })
    }

    async loadTasks() {
        await Promise.all(
            await db.tasks
                .where(TASK_LIST)
                .equals(this.id)
                .toArray((tasks) => (this.tasks = tasks))
        )
        return this
    }
}

export class Task {
    id: UniqueIdentifier
    list_id: number
    sorted_order: number
    name: string
    epic_id: number
    epic?: Task
    is_epic: boolean
    story_points: number
    description: string
    list_name?: string
    task_count?: number // if epic, the number tasks on epic

    constructor(
        id: number,
        list_id: number,
        epic_id: number,
        sorted_order: number,
        is_epic: boolean,
        story_points: number,
        description: string,
        name: string
    ) {
        this.id = id
        this.list_id = list_id
        this.epic_id = epic_id
        this.sorted_order = sorted_order
        this.is_epic = is_epic
        this.story_points = story_points
        this.description = description
        this.name = name
    }

    async loadListName() {
        const list = await db.lists.where(ID).equals(this[TASK_LIST]).first()
        this.list_name = list?.name
        return this
    }

    async loadTaskCount() {
        const tasks = await db.tasks.where(TASK_EPIC).equals(this.id).toArray()

        const filteredTasks = (
            await Promise.all(
                tasks.map((list) => {
                    return list.loadListName()
                })
            )
        ).filter((task) => {
            return task.list_name != 'Done'
        })

        this.task_count = filteredTasks.length
        return this
    }
}

export interface CheckList {
    id: UniqueIdentifier
    sorted_order: number
    name: string
    checked: boolean
}
