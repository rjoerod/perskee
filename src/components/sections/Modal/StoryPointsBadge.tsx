import { useState } from 'react'
import { Task } from '../../../util/types'
import { STORY_POINT_COLUMN } from '../../../util/properties'
import SingleInput from '../../util/SingleInput'
import ToastMessage from '../../util/ToastMessage'
import { db } from '../../../util/db'
import styles from './StoryPointsBadge.module.scss'

const KNOWN_STORY_POINTS = new Set([1, 2, 3, 5, 8])

interface StoryPointsBadgeProps {
    modalItem: Task
}

const StoryPointsBadge = ({ modalItem }: StoryPointsBadgeProps) => {
    const [showLabelInput, setShowLabelInput] = useState(false)
    const pts = KNOWN_STORY_POINTS.has(Number(modalItem.story_points))
        ? String(modalItem.story_points)
        : undefined

    const onConfirm = async (value: string) => {
        if (!modalItem) {
            ToastMessage('Failed to find task')
            return
        }

        if (isNaN(Number(value))) {
            ToastMessage('New value is not a number')
            return
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [STORY_POINT_COLUMN]: value,
            })
        } catch (e) {
            ToastMessage('Failed to delete list')
        } finally {
            setShowLabelInput(false)
        }
    }

    return (
        <div>
            <div onClick={() => setShowLabelInput(true)}>
                {showLabelInput ? (
                    <div className={styles.inputWrap}>
                        <SingleInput
                            initialValue={String(modalItem?.story_points ?? 0)}
                            handleSubmit={onConfirm}
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => setShowLabelInput(true)}
                        className={styles.badgeWrap}
                    >
                        <div className={styles.badgeOuter} data-points={pts}>
                            <div className={styles.badgeInner} data-points={pts}>P</div>
                            <div>{modalItem.story_points}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StoryPointsBadge
