import { UniqueIdentifier } from '@dnd-kit/core'
import { db } from './db'
import { ID, TASK_EPIC, TASK_LIST } from './mysql'

export interface Board {
    id: UniqueIdentifier
    name: string
}

export class List {
    board_id: number
    sorted_order: number
    name: string
    id?: UniqueIdentifier
    tasks?: Task[]

    constructor(
        board_id: number,
        sorted_order: number,
        name: string,
        id?: number
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
        if (!this.id) {
            return
        }

        await Promise.all(
            await db.tasks
                .where(TASK_LIST)
                .equals(this.id)
                .toArray((tasks) => (this.tasks = tasks as Task[]))
        )
        if (this.tasks) {
            await Promise.all(
                this.tasks
                    .sort((a, b) => {
                        return a.sorted_order - b.sorted_order
                    })
                    .map((list) => {
                        return list.loadEpic()
                    })
            )
        }
        return this
    }
}

export interface TaskI {
    id?: UniqueIdentifier
    list_id: number
    sorted_order: number
    name: string
    epic_id: number
    epic?: Task
    is_epic: boolean
    story_points: number
    description: string
    list_name?: string
    task_count?: number
}

export class Task implements TaskI {
    id?: UniqueIdentifier
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
        list_id: number,
        epic_id: number,
        sorted_order: number,
        is_epic: boolean,
        story_points: number,
        description: string,
        name: string,
        id?: number
    ) {
        if (id) this.id = id
        this.list_id = list_id
        this.epic_id = epic_id
        this.sorted_order = sorted_order
        this.is_epic = is_epic
        this.story_points = story_points
        this.description = description
        this.name = name
    }

    async loadEpic() {
        const epic = (await db.tasks
            .where(ID)
            .equals(this[TASK_EPIC])
            .first()) as Task
        this.epic = epic
        return this
    }

    async loadListName() {
        const list = await db.lists.where(ID).equals(this[TASK_LIST]).first()
        this.list_name = list?.name
        return this
    }

    async loadTaskCount() {
        if (!this.id) {
            return
        }

        const tasks = (await db.tasks
            .where(TASK_EPIC)
            .equals(this.id)
            .toArray()) as Task[]

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
