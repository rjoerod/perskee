import { useState } from 'react'
import { Task } from '../../../util/types'
import Button from '../../buttons/Button'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../util/db'
import { TASK_EPIC } from '../../../util/mysql'

const useEpicTasks = (epic: Task) => {
    const tasks = useLiveQuery(async () => {
        const tasks = (await db.tasks
            .where(TASK_EPIC)
            .equals(Number(epic.id))
            .toArray()) as Task[]
        return Promise.all(
            tasks.map((task) => {
                return task.loadListName()
            })
        )
    }, [epic.id])

    if (!epic.is_epic) {
        return null
    }

    return tasks
}

const PaginatedTasks = ({ tasks }: { tasks: Task[] }) => {
    const [page, setPage] = useState(0)
    const PER_PAGE = 5
    const max_page = Math.ceil(tasks.length / PER_PAGE)

    const currentTasks = tasks.slice(
        page * PER_PAGE,
        page * PER_PAGE + PER_PAGE
    )

    const completedTasksCount = tasks.reduce((prev, curr) => {
        if (curr.list_name == 'Done') return prev + 1
        else return prev
    }, 0)

    const remainder = PER_PAGE - currentTasks.length

    return (
        <div className="pt-6">
            <div className="text-lg font-bold mb-3">
                Epic Tasks ({completedTasksCount} / {tasks.length} Completed)
            </div>
            <ul className="pl-12 list-disc">
                {currentTasks?.map((task) => {
                    return (
                        <li
                            className={`p-1 ${
                                task.list_name == 'Done'
                                    ? 'text-green-500'
                                    : 'text-white-500'
                            }`}
                            key={task.id}
                        >
                            {task.name}
                        </li>
                    )
                })}
                {[...Array(remainder)].map((_, idx) => {
                    return <li className={`p-1 invisible`} key={idx}></li>
                })}
            </ul>
            <div className="grid grid-cols-3 mt-6">
                <Button onClick={() => setPage(page - 1)} disabled={page == 0}>
                    PREV
                </Button>
                <div className="justify-self-center self-center">
                    {page + 1} of {max_page}
                </div>
                <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= max_page - 1}
                >
                    NEXT
                </Button>
            </div>
        </div>
    )
}

const EpicTaskList = ({ epic }: { epic: Task }) => {
    const tasks = useEpicTasks(epic)

    if (!tasks) {
        return <></>
    }

    return <PaginatedTasks tasks={tasks} />
}

export default EpicTaskList
