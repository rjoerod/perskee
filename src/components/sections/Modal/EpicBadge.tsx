import ToastMessage from '../../util/ToastMessage'
import { TASK_EPIC } from '../../../util/mysql'
import { Combobox, Popover } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef, useState } from 'react'
import { Task } from '../../../util/types'
import { useEpics } from '../../../util/util'
import { db } from '../../../util/db'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../../util/queryRouting'

interface EpicBadgeProps {
    modalItem: Task
}

const EpicBadge = ({ modalItem }: EpicBadgeProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)

    // const searchParams = useSearchParams();
    // const pathname = usePathname();
    const [searchParams, setSearchParams] = useSearchParams()
    const [showComboBox, setShowComboBox] = useState(false)
    const [selected] = useState()
    const [query, setQuery] = useState('')

    const handleClickOutside = (event: MouseEvent) => {
        if (
            wrapperRef.current &&
            !wrapperRef.current.contains(event?.target as Node)
        ) {
            setShowComboBox(false)
        }
    }

    useEffect(() => {
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const data = useEpics(false)

    const filteredEpics =
        data?.tasks?.filter((task: Task) => {
            return (
                query == '' ||
                task.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )
        }) ?? []

    const onEpicConfirm = async (epic: Task | string) => {
        let newEpic
        if (typeof epic == 'string') {
            newEpic = null
        } else {
            if (!modalItem) {
                ToastMessage('Failed to find task')
                return
            }
            newEpic = Number(epic.id)
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [TASK_EPIC]: newEpic,
            })

            if (searchParams.get('epic_id')) {
                route(searchParams, setSearchParams, 'epic_id', newEpic)
            }
        } catch (e) {
            ToastMessage('Failed to delete list')
        } finally {
            setShowComboBox(false)
        }
    }

    return (
        <div ref={wrapperRef}>
            <div onClick={() => setShowComboBox(true)}>
                {modalItem.epic ? (
                    <div className="bg-sky-600 py-[6px] px-3 rounded text-slate-100 cursor-pointer hover:bg-sky-700">
                        {modalItem?.epic?.name}
                    </div>
                ) : (
                    <div className="bg-transparent ring-1 ring-slate-700 hover:bg-slate-700 py-[6px] px-3 rounded text-slate-100 cursor-pointer">
                        Add to epic
                    </div>
                )}
            </div>
            {showComboBox && (
                <Popover className="absolute">
                    <Popover.Panel static>
                        <Combobox value={selected} onChange={onEpicConfirm}>
                            <div className="relative mt-1">
                                <div className="relative w-48 cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                    <Combobox.Input
                                        className="w-48 border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={(epic: Task) => epic.name}
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
                                <Combobox.Options
                                    static
                                    className="absolute mt-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    {filteredEpics.length === 0 &&
                                    query !== '' ? (
                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                            Nothing found.
                                        </div>
                                    ) : (
                                        <>
                                            <Combobox.Option
                                                key={'no-epic'}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-3 pr-4 ${
                                                        active
                                                            ? 'bg-teal-600 text-white'
                                                            : 'text-gray-900'
                                                    }`
                                                }
                                                value={'no-epic'}
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
                                                            No Epic
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
                                            {filteredEpics.map((epic: Task) => (
                                                <Combobox.Option
                                                    key={epic.id}
                                                    className={({ active }) =>
                                                        `relative cursor-pointer select-none py-2 pl-3 pr-4 ${
                                                            active
                                                                ? 'bg-teal-600 text-white'
                                                                : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={epic}
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
                                                                {epic.name}
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
            )}
        </div>
    )
}

export default EpicBadge
