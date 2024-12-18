import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'
import Button from '../buttons/Button'

interface GenericFilterProps {
    title: string
    state: string
    updateRoute: (s: string) => void
    updateState: (s: string) => void
}

const GenericFilter = ({
    title,
    state,
    updateRoute,
    updateState,
}: GenericFilterProps) => {
    return (
        <div className="px-9 pt-6 pb-8 border-t border-t-slate-700">
            <div className="pb-4 text-lg font-semibold">{title}</div>
            <div className="flex flex-col grow max-h-full gap-6">
                <input
                    className="w-full py-1 px-2 border-gray-400 border-2 bg-gray-900 rounded"
                    onChange={(e) => {
                        updateState(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateRoute(state)
                        }
                    }}
                    value={state}
                />
                <div className="flex gap-8">
                    <Button
                        onClick={() => {
                            updateState('')
                            updateRoute('')
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            updateRoute(state)
                        }}
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    )
}

const TitleFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const titleParam = searchParams?.get('title') ?? ''
    const [title, setTitle] = useState(titleParam ?? '')

    return (
        <GenericFilter
            title="Filter By Title"
            state={title}
            updateRoute={(title: string) =>
                route(setSearchParams, 'title', title)
            }
            updateState={setTitle}
        />
    )
}

const DescriptionFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const descriptionParam = searchParams?.get('description') ?? ''
    const [description, setDescription] = useState(descriptionParam ?? '')

    return (
        <GenericFilter
            title="Filter By Description"
            state={description}
            updateRoute={(description: string) =>
                route(setSearchParams, 'description', description)
            }
            updateState={setDescription}
        />
    )
}

const HighlightedTaskFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const higlightedTaskParam = searchParams?.get('highlighted') ?? 0
    const [isHighlighted, setIsHighlighted] = useState(higlightedTaskParam)

    const updateHighlightedFilter = (val: number) => {
        setIsHighlighted(val)
        route(setSearchParams, 'highlighted', val)
    }

    return (
        <div className="px-9 py-4 border-t border-t-slate-700">
            <div className="py-4 text-lg font-semibold">
                Filter By Highlighted
            </div>
            <div className="flex flex-col grow max-h-full gap-6">
                <div className="flex gap-8">
                    <label
                        className={`${
                            isHighlighted === 0
                                ? 'bg-sky-600 '
                                : 'bg-slate-600 hover:bg-slate-700'
                        } rounded py-2 pl-6 pr-7 cursor-pointer`}
                        onChange={() => updateHighlightedFilter(0)}
                    >
                        <b className="select-none">OFF</b>
                        <input
                            className="ml-6"
                            type="radio"
                            name="highlighted"
                            value={isHighlighted}
                            checked={isHighlighted === 0}
                            readOnly
                        />
                    </label>
                    <label
                        className={`${
                            isHighlighted === 1
                                ? 'bg-sky-600'
                                : 'bg-slate-600 hover:bg-slate-700'
                        } rounded py-2 pl-6 pr-7 cursor-pointer`}
                        onChange={() => updateHighlightedFilter(1)}
                    >
                        <b className="select-none">ON</b>
                        <input
                            className="ml-6"
                            type="radio"
                            name="highlighted"
                            value={isHighlighted}
                            checked={isHighlighted === 1}
                            readOnly
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

interface TaskFiltersModalProps {
    open: boolean
    onClose: () => void
}

const TaskFiltersModal = ({ open, onClose }: TaskFiltersModalProps) => {
    return (
        <Dialog
            as="div"
            className="relative z-50"
            open={open}
            onClose={onClose}
        >
            <div
                className={`fixed inset-0 p-8 max-h-4/5 z-10 flex justify-center overflow-y-auto bg-gray-950/50`}
            >
                <div className="fixed inset-0 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="rounded-lg flex flex-col min-h-full bg-slate-800 text-white w-2/5 max-w-2xl min-w-[632px] py-8 px-8">
                            <Dialog.Title className="text-slate-100 text-3xl mb-6 font-bold">
                                <div>
                                    <h3>Task Filters</h3>
                                </div>
                            </Dialog.Title>
                            <TitleFilter />
                            <DescriptionFilter />
                            <HighlightedTaskFilter />
                        </Dialog.Panel>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default TaskFiltersModal
