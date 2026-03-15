import { useState } from 'react'
import {
    DESCRIPTION_COLUMN,
    IS_EPIC_COLUMN,
    LIST_BOARD,
    NAME_COLUMN,
    SORTED_ORDER_COLUMN,
    STORY_POINT_COLUMN,
    TASK_EPIC,
    TASK_LIST,
} from '../../../util/properties'
import { Task, List } from '../../../util/types'
import Button from '../../buttons/Button'
import ConfirmationModal from '../../util/ConfirmationModal'
import ToastMessage from '../../util/ToastMessage'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../util/db'
import styles from './EpicGenerateTasksButton.module.scss'

function ChevronUpDown() {
    return (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
            />
        </svg>
    )
}

const EpicGenerateTasksButton = ({
    epic,
    lists,
}: {
    epic: Task
    lists: List[]
}) => {
    const [open, setOpen] = useState(false)
    const [selectedList, setSelectedList] = useState<List | null>(null)
    const [query, setQuery] = useState('')
    const [listOpen, setListOpen] = useState(false)

    const handleListSelect = (list: List) => {
        setSelectedList(list)
        setQuery(list.name)
        setListOpen(false)
    }

    const onClick = async () => {
        if (!selectedList) {
            ToastMessage('No list selected!')
            return
        }

        try {
            const lastTaskInList = selectedList.tasks?.sort((a, b) => {
                return b.sorted_order - a.sorted_order
            })?.[0]

            const maxOrder = lastTaskInList?.sorted_order ?? 0

            /*
                Parse description for bullet points
            */
            const description = epic.description
            const splitDescription = description.split('\n')
            const filteredDesc = splitDescription.filter((str: string) => {
                return (
                    (str[0] == '-' && str[1] == ' ') ||
                    str[0] == '[' ||
                    str[0] == '#'
                )
            })
            const mappedDesc = filteredDesc.map((str: string) => {
                return str.split('\n')[0]
            })

            // Final array to create tasks from
            const finalDesc = []
            // List of prefixes to create multiple
            let descPrefixes = ['']

            for (const desc of mappedDesc) {
                // Reset prefixes
                if (desc[0] == '#') {
                    descPrefixes = ['']
                    continue
                }

                // Set prefix
                if (desc[0] == '[') {
                    const trimmedString = desc.replace('[', '').replace(']', '')
                    const splitArray = trimmedString.split(',')
                    descPrefixes = splitArray.map((desc: string) => desc.trim())
                    continue
                }

                // Create task names
                for (const prefix of descPrefixes) {
                    if (prefix != '') {
                        finalDesc.push(prefix + desc.replace('- ', ' '))
                    } else {
                        finalDesc.push(desc.replace('- ', ''))
                    }
                }
            }

            const finalTasks = finalDesc.map((desc, idx) => {
                const splitDesc = desc.split('(')
                const newDesc = splitDesc?.[1] ?? ''
                return {
                    [NAME_COLUMN]: splitDesc[0].trim(),
                    [DESCRIPTION_COLUMN]: newDesc.replace(')', '').trim(),
                    [TASK_LIST]: Number(selectedList.id),
                    [TASK_EPIC]: Number(epic.id),
                    [SORTED_ORDER_COLUMN]: maxOrder + 1 + idx,
                    [IS_EPIC_COLUMN]: 0,
                    [STORY_POINT_COLUMN]: 0,
                }
            })
            await db.tasks.bulkAdd(finalTasks)
            setOpen(false)
        } catch (e) {
            ToastMessage('Failed to generate tasks')
        }
    }

    const filteredLists =
        lists?.filter((list: List) => {
            return (
                query == '' ||
                list.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )
        }) ?? []

    return (
        <>
            <ConfirmationModal
                label={`Generate Tasks for  "${epic?.name}"?`}
                open={open}
                onCancel={() => {
                    setOpen(false)
                }}
                onConfirm={onClick}
            >
                <div className={styles.comboboxWrap}>
                    <div className={styles.comboboxInputRow}>
                        <input
                            className={styles.comboboxInput}
                            value={query}
                            placeholder="Search lists..."
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setListOpen(true)
                            }}
                            onFocus={() => setListOpen(true)}
                            onBlur={() =>
                                setTimeout(() => setListOpen(false), 120)
                            }
                        />
                        <span className={styles.comboboxChevron} aria-hidden="true">
                            <ChevronUpDown />
                        </span>
                    </div>
                    {listOpen && (
                        <ul className={styles.comboboxList}>
                            {filteredLists.length === 0 && query !== '' ? (
                                <li className={styles.comboboxEmpty}>
                                    Nothing found.
                                </li>
                            ) : (
                                filteredLists.map((list: List) => (
                                    <li
                                        key={list.id}
                                        className={
                                            selectedList?.id === list.id
                                                ? styles.comboboxOptionSelected
                                                : styles.comboboxOption
                                        }
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleListSelect(list)}
                                    >
                                        {list.name}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </ConfirmationModal>
            <Button size="base" onClick={() => setOpen(true)}>
                Generate Tasks
            </Button>
        </>
    )
}

const useLists = () => {
    const lists = useLiveQuery(async () => {
        const lists = await db.lists.where(LIST_BOARD).equals(1).toArray()
        return Promise.all(
            lists.map((list) => {
                return list.loadTasks()
            })
        )
    }, [])

    const filteredLists = lists?.filter((list) => {
        return list
    })

    return filteredLists as List[]
}

const EpicGenerateTasksButtonQuery = ({ epic }: { epic: Task }) => {
    const lists = useLists()

    // bounce if not epic
    if (!epic.is_epic || !lists) {
        return <></>
    }

    return <EpicGenerateTasksButton epic={epic} lists={lists} />
}

export default EpicGenerateTasksButtonQuery
