import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import ToastMessage, { ToastInfo } from '../../util/ToastMessage'
import SingleInput from '../../util/SingleInput'
import EpicBadge from './EpicBadge'
import StoryPointsBadge from './StoryPointsBadge'
import MarkdownEditor from './MarkdownEditor'
import EpicTaskList from './EpicTaskList'
import EpicGenerateTasksButton from './EpicGenerateTasksButton'
import { useSearchParams } from 'react-router-dom'
import { IS_HIGHLIGHTED_COLUMN, LAST_CHANGED_COLUMN, NAME_COLUMN } from '../../../util/properties'
import { Task } from '../../../util/types'
import Button from '../../buttons/Button'
import { route } from '../../../util/queryRouting'
import { db } from '../../../util/db'
import ListBadge from './ListBadge'
import { useLiveQuery } from 'dexie-react-hooks'
import styles from './TaskCardModal.module.scss'

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
                [LAST_CHANGED_COLUMN]: new Date().toISOString(),
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
                [LAST_CHANGED_COLUMN]: new Date().toISOString(),
            })
        } catch (e) {
            ToastMessage('Failed to update highlight flag')
        } finally {
            setShowLabelInput(false)
        }
    }

    const isNotEpic = modalItem && !modalItem?.is_epic

    return (
        <Dialog.Root open={!!modalItem} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay}>
                    <Dialog.Content className={styles.panel} aria-describedby={undefined}>
                        <Dialog.Title className={styles.title}>
                            {showLabelInput ? (
                                <SingleInput
                                    initialValue={modalItem?.name ?? ''}
                                    handleSubmit={onNameConfirm}
                                />
                            ) : (
                                <div onClick={() => setShowLabelInput(true)}>
                                    <h3>{modalItem?.name}</h3>
                                </div>
                            )}
                        </Dialog.Title>
                        <div className={styles.badges}>
                            {modalItem && (
                                <ListBadge modalItem={modalItem} />
                            )}
                            {isNotEpic && (
                                <>
                                    <EpicBadge modalItem={modalItem} />
                                    <StoryPointsBadge modalItem={modalItem} />
                                </>
                            )}
                            <div>
                                <Button
                                    size="base"
                                    className={styles.textBtn}
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
                            {modalItem && Boolean(modalItem.is_epic) && (
                                <>
                                    <div>
                                        <EpicGenerateTasksButton
                                            epic={modalItem}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            size="base"
                                            className={styles.textBtn}
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
                        <div className={styles.description}>
                            {modalItem && (
                                <MarkdownEditor modalItem={modalItem} />
                            )}
                        </div>
                        {modalItem && Boolean(modalItem.is_epic) && (
                            <EpicTaskList epic={modalItem} />
                        )}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
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
