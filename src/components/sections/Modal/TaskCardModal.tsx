import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import ToastMessage from '../../util/ToastMessage'
import SingleInput from '../../util/SingleInput'
import EpicBadge from './EpicBadge'
import StoryPointsBadge from './StoryPointsBadge'
import MarkdownEditor from './MarkdownEditor'
import EpicTaskList from './EpicTaskList'
import EpicGenerateTasksButton from './EpicGenerateTasksButton'
import { useSearchParams } from 'react-router-dom'
import { NAME_COLUMN } from '../../../util/mysql'
import { Task } from '../../../util/types'
import Button from '../../buttons/Button'
import { route } from '../../../util/queryRouting'
import { db } from '../../../util/db'

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
            ToastMessage('Failed to delete list')
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
                            <Dialog.Panel className="rounded-lg flex flex-col min-h-full bg-slate-800 text-white w-2/5 max-w-2xl min-w-[480px] py-8 px-8">
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
                                            className="hover:underline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `[${modalItem?.name}](${window.location.href})`
                                                )
                                            }}
                                        >
                                            Copy Card Link
                                        </Button>
                                    </div>
                                    <div>
                                        {modalItem &&
                                            Boolean(modalItem.is_epic) && (
                                                <EpicGenerateTasksButton
                                                    epic={modalItem}
                                                />
                                            )}
                                    </div>
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

export default TaskCardModal
