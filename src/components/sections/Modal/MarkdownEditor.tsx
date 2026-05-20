import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { Task } from '../../../util/types'
import { DESCRIPTION_COLUMN, LAST_CHANGED_COLUMN } from '../../../util/properties'
import useWindowDimensions from '../../../util/util'
import Button from '../../buttons/Button'
import ToastMessage from '../../util/ToastMessage'
import { db } from '../../../util/db'
import styles from './MarkdownEditor.module.scss'

interface MarkdownEditorProps {
    modalItem: Task
}

const MarkdownEditor = ({ modalItem }: MarkdownEditorProps) => {
    const [value, setValue] = React.useState<string | undefined>(
        modalItem?.description ?? ''
    )
    const [showEditor, setShowEditor] = useState(false)

    const { height } = useWindowDimensions()

    const onConfirm = async (value: string) => {
        if (!modalItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [DESCRIPTION_COLUMN]: value,
                [LAST_CHANGED_COLUMN]: new Date().toISOString(),
            })
        } catch (e) {
            ToastMessage('Failed to delete list')
        } finally {
            setShowEditor(false)
        }
    }

    const onEditorOpen = (e: React.SyntheticEvent<HTMLElement>) => {
        var element = e.target as HTMLElement
        if (element.tagName.toLowerCase() === 'a') return

        setShowEditor(true)
        const cachedDescription = sessionStorage.getItem(
            `${modalItem.name}-desc-${modalItem.id}`
        )
        if (cachedDescription && cachedDescription != value) {
            setValue(cachedDescription)
        }
    }

    return (
        <div>
            <div>
                <div className={styles.editorHeader}>
                    <div className={styles.editorTitle}>
                        Description
                    </div>
                    {!showEditor && (
                        <div className={styles.editBtnWrap}>
                            <Button label={'Edit'} onClick={onEditorOpen} />
                        </div>
                    )}
                </div>
                {showEditor ? (
                    <MDEditor
                        height={`${(height * 2) / 3}px`}
                        value={value}
                        onChange={(newValue) => {
                            setValue(newValue)
                            sessionStorage.setItem(
                                `${modalItem.name}-desc-${modalItem.id}`,
                                newValue ?? ''
                            )
                        }}
                    />
                ) : (
                    (modalItem?.description ?? '').trim() != '' && (
                        <div
                            className={styles.previewWrap}
                            onClick={onEditorOpen}
                        >
                            <Markdown className={styles.markdown}>
                                {modalItem?.description ?? ''}
                            </Markdown>
                        </div>
                    )
                )}
            </div>
            {showEditor && (
                <div className={styles.actionRow}>
                    <Button
                        label={'Cancel'}
                        onClick={() => setShowEditor(false)}
                    />
                    <Button
                        label={'Save'}
                        onClick={() => onConfirm(value ?? '')}
                    />
                </div>
            )}
        </div>
    )
}

export default MarkdownEditor
