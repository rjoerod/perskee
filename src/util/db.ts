import Dexie from 'dexie'
import 'dexie-export-import'
import { Board, List, Task } from './types'

export class PerskeeDB extends Dexie {
    boards!: Dexie.Table<Board, number>
    lists: Dexie.Table<List, number>
    tasks!: Dexie.Table<Task, number>

    constructor() {
        super('PerskeeDB')

        var db = this

        db.version(1).stores({
            boards: '++id', // Primary key and indexed props
            lists: '++id, board_id',
            tasks: '++id, list_id, epic_id, is_epic',
        })

        this.boards = db.table('boards')
        this.lists = db.table('lists')
        this.tasks = db.table('tasks')
        this.lists.mapToClass(List)
    }
}

export const db = new PerskeeDB()
