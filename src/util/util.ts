import { useLiveQuery } from 'dexie-react-hooks'
import { List, Task } from './types'
import { useState, useEffect } from 'react'
import { db } from './db'
import { IS_EPIC_COLUMN, NAME_COLUMN } from './properties'

export function findListFromName(id: string, listData: List[] | undefined) {
    if (!listData) {
        return
    }

    const list = listData.find((list) => {
        return list.name == id
    })

    if (!list) {
        return
    }

    return list
}

// https://github.com/tailwindlabs/headlessui/discussions/820
export const idiotsAtHeadlessUI = (e: {
    code: string
    stopPropagation: () => void
}) => {
    if (e.code === 'Space') {
        e.stopPropagation()
    }
}

export function useEpics(filtered = true): { tasks: Task[] } {
    const tasks = useLiveQuery(async () => {
        if (filtered) {
            const tasks = (await db.tasks
                .where(IS_EPIC_COLUMN)
                .equals(1)
                .toArray()) as Task[]
            return Promise.all(
                tasks.map((task) => {
                    return task.loadTaskCount()
                })
            )
        }

        const tasks = await db.tasks.where(IS_EPIC_COLUMN).equals(1).toArray()
        return tasks.sort((a, b) => {
            return a[NAME_COLUMN] < b[NAME_COLUMN] ? -1 : 1
        })
    }, [filtered]) as Task[]

    if (filtered) {
        return {
            tasks: tasks
                ?.sort((a, b) => {
                    return (b?.task_count ?? 0) - (a?.task_count ?? 0)
                })
                .filter((task) => {
                    return !!task && (task?.task_count ?? 0) > 0
                }),
        }
    }

    return { tasks }
}

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height,
    }
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
        getWindowDimensions()
    )

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}
