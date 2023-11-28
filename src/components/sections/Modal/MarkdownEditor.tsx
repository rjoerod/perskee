import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { Task } from '../../../util/types'
import { DESCRIPTION_COLUMN } from '../../../util/mysql'
import useWindowDimensions from '../../../util/util'
import Button from '../../buttons/Button'
import ToastMessage from '../../util/ToastMessage'
import { db } from '../../../util/db'

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
            })
        } catch (e) {
            ToastMessage('Failed to delete list')
        } finally {
            setShowEditor(false)
        }
    }

    return (
        <div>
            <div>
                <div className="flex justify-between items-end pb-4">
                    <div className="text-xl font-semibold text-slate-400">
                        Description
                    </div>
                    {!showEditor && (
                        <div className="w-1/6">
                            <Button
                                label={'Edit'}
                                onClick={() => setShowEditor(true)}
                            />
                        </div>
                    )}
                </div>
                {showEditor ? (
                    <MDEditor
                        height={`${(height * 2) / 3}px`}
                        value={value}
                        onChange={setValue}
                    />
                ) : (
                    (modalItem?.description ?? '').trim() != '' && (
                        <div
                            className="ring-1 p-4 rounded ring-slate-500 cursor-pointer"
                            onClick={() => setShowEditor(true)}
                        >
                            <Markdown className="prose prose-invert prose-slate prose-hr:-mt-4 prose-hr:mb-6 prose-ul:mb-8">
                                {modalItem?.description ?? ''}
                            </Markdown>
                        </div>
                    )
                )}
            </div>
            {showEditor && (
                <div className="flex justify-between gap-10 pt-4 w-1/2">
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
