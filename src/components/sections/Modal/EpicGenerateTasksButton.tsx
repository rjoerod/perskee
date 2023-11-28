import { Combobox, Popover } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
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
                    [IS_EPIC_COLUMN]: false,
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
                <Popover>
                    <Popover.Panel static>
                        <Combobox
                            value={selectedList}
                            onChange={(list) => setSelectedList(list)}
                        >
                            <div className="relative mt-1 pt-4">
                                <div className="relative w-48 cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                    <Combobox.Input
                                        className="w-48 border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={(list: List) =>
                                            list?.name ?? ''
                                        }
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon
                                            className="h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </Combobox.Button>
                                </div>
                                <Combobox.Options className="absolute mt-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {filteredLists.length === 0 &&
                                    query != '' ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                            Nothing found.
                                        </div>
                                    ) : (
                                        <>
                                            {filteredLists.map((list: List) => (
                                                <Combobox.Option
                                                    key={list.id}
                                                    className={({ active }) =>
                                                        `relative cursor-pointer select-none py-2 pl-3 pr-4 ${
                                                            active
                                                                ? 'bg-teal-600 text-white'
                                                                : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={list}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${
                                                                    selected
                                                                        ? 'font-medium'
                                                                        : 'font-normal'
                                                                }`}
                                                            >
                                                                {list.name}
                                                            </span>
                                                            {selected ? (
                                                                <span
                                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                                        active
                                                                            ? 'text-white'
                                                                            : 'text-teal-600'
                                                                    }`}
                                                                >
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))}
                                        </>
                                    )}
                                </Combobox.Options>
                            </div>
                        </Combobox>
                    </Popover.Panel>
                </Popover>
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
