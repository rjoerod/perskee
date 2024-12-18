import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import ToastMessage, { ToastInfo } from '../../util/ToastMessage'
import SingleInput from '../../util/SingleInput'
import EpicBadge from './EpicBadge'
import StoryPointsBadge from './StoryPointsBadge'
import MarkdownEditor from './MarkdownEditor'
import EpicTaskList from './EpicTaskList'
import EpicGenerateTasksButton from './EpicGenerateTasksButton'
import { useSearchParams } from 'react-router-dom'
import { IS_HIGHLIGHTED_COLUMN, NAME_COLUMN } from '../../../util/properties'
import { Task } from '../../../util/types'
import Button from '../../buttons/Button'
import { route } from '../../../util/queryRouting'
import { db } from '../../../util/db'
import ListBadge from './ListBadge'
import { useLiveQuery } from 'dexie-react-hooks'

const useTaskCardModalQuery = (modalItem: Task | null) => {
    const task = useLiveQuery(async () => {
        if (!modalItem) return modalItem

        return modalItem.loadListName()
    }, [modalItem])

    return task
}

interface TaskCardModalProps {
    modalItem: Task | null
}

function TaskCardModal({ modalItem }: TaskCardModalProps) {
    const [showLabelInput, setShowLabelInput] = useState(false)
    const [_, setSearchParams] = useSearchParams()

    const onClose = () => {
        route(setSearchParams, 'task_id', null)
    }

    const onNameConfirm = async (value: string) => {
        if (!modalItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [NAME_COLUMN]: value,
            })
        } catch (e) {
            ToastMessage('Failed to update name')
        } finally {
            setShowLabelInput(false)
        }
    }

    const onHighlightConfirm = async (value: boolean) => {
        if (!modalItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [IS_HIGHLIGHTED_COLUMN]: value,
            })
        } catch (e) {
            ToastMessage('Failed to update highlight flag')
        } finally {
            setShowLabelInput(false)
        }
    }

    const isNotEpic = modalItem && !modalItem?.is_epic

    return (
        <>
            <Dialog
                as="div"
                className="relative z-50"
                open={!!modalItem}
                onClose={onClose}
            >
                <div
                    className={`fixed inset-0 p-8 max-h-4/5 z-10 flex justify-center overflow-y-auto ${
                        modalItem && 'bg-gray-950/50'
                    }`}
                >
                    <div className="fixed inset-0 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="rounded-lg flex flex-col min-h-full bg-slate-800 text-white w-2/5 max-w-2xl min-w-[632px] py-8 px-8">
                                <Dialog.Title className="text-slate-100 text-3xl mb-6 font-bold">
                                    {showLabelInput ? (
                                        <SingleInput
                                            initialValue={modalItem?.name ?? ''}
                                            handleSubmit={onNameConfirm}
                                        />
                                    ) : (
                                        <div
                                            onClick={() =>
                                                setShowLabelInput(true)
                                            }
                                        >
                                            <h3>{modalItem?.name}</h3>
                                        </div>
                                    )}
                                </Dialog.Title>
                                <div className="flex gap-6 mb-6">
                                    {modalItem && (
                                        <ListBadge modalItem={modalItem} />
                                    )}
                                    {isNotEpic && (
                                        <>
                                            <EpicBadge modalItem={modalItem} />
                                            <StoryPointsBadge
                                                modalItem={modalItem}
                                            />
                                        </>
                                    )}
                                    <div>
                                        <Button
                                            size="base"
                                            className="hover:underline py-[6px] px-3"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `[${modalItem?.name}](${window.location.href})`
                                                )
                                                ToastInfo('Copied to clipboard')
                                            }}
                                        >
                                            Copy Card Link
                                        </Button>
                                    </div>

                                    {modalItem &&
                                        Boolean(modalItem.is_epic) && (
                                            <>
                                                <div>
                                                    <EpicGenerateTasksButton
                                                        epic={modalItem}
                                                    />
                                                </div>
                                                <div>
                                                    <Button
                                                        size="base"
                                                        className="hover:underline"
                                                        onClick={() => {
                                                            onHighlightConfirm(
                                                                !modalItem?.is_highlighted
                                                            )
                                                        }}
                                                    >
                                                        {modalItem?.is_highlighted
                                                            ? 'Un-highlight Epic'
                                                            : 'Highlight Epic'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                </div>
                                <div className="text-left">
                                    {modalItem && (
                                        <MarkdownEditor modalItem={modalItem} />
                                    )}
                                </div>

                                {modalItem && Boolean(modalItem.is_epic) && (
                                    <EpicTaskList epic={modalItem} />
                                )}
                            </Dialog.Panel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

const TaskCardModalQuery = ({ modalItem }: TaskCardModalProps) => {
    const task = useTaskCardModalQuery(modalItem)

    if (!task?.list_name) {
        return <></>
    }

    return <TaskCardModal modalItem={task} />
}

export default TaskCardModalQuery
