import { Combobox, Popover } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { LIST_BOARD, TASK_LIST } from '../../../util/mysql'
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
            // TODO: implement
            await fetch(`/api/task/generateTasks/${epic.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    [TASK_LIST]: selectedList.id,
                }),
            })
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
        return db.lists.where(LIST_BOARD).equals(1).toArray()
    }, [])

    return lists
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
