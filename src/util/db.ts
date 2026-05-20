import Dexie from 'dexie'
import 'dexie-export-import'
import { Board, List, Settings, Task, TaskI } from './types'

export class PerskeeDB extends Dexie {
    boards!: Dexie.Table<Board, number>
    lists: Dexie.Table<List, number>
    tasks: Dexie.Table<TaskI, number>
    settings!: Dexie.Table<Settings, number>

    constructor() {
        super('PerskeeDB')

        var db = this

        db.version(1).stores({
            boards: '++id', // Primary key and indexed props
            lists: '++id, board_id',
            tasks: '++id, list_id, epic_id, is_epic',
        })

        db.version(2).stores({
            boards: '++id',
            lists: '++id, board_id',
            tasks: '++id, list_id, epic_id, is_epic, is_archived',
            settings: '++id',
        })

        this.boards = db.table('boards')
        this.lists = db.table('lists')
        this.tasks = db.table('tasks')
        this.settings = db.table('settings')
        this.lists.mapToClass(List)
        this.tasks.mapToClass(Task)
    }
}

export const db = new PerskeeDB()
