import ToastMessage from '../../util/ToastMessage'
import { TASK_EPIC } from '../../../util/properties'
import { Task } from '../../../util/types'
import { useEpics } from '../../../util/util'
import { db } from '../../../util/db'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../../util/queryRouting'
import ComboboxPopover, { ComboboxItem } from '../../util/ComboboxPopover'
import styles from './EpicBadge.module.scss'

interface EpicBadgeProps {
    modalItem: Task
}

const EpicBadge = ({ modalItem }: EpicBadgeProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const data = useEpics(false)

    const epicItems: ComboboxItem[] =
        data?.tasks?.map((t: Task) => ({ id: t.id, name: t.name })) ?? []

    const onEpicConfirm = async (item: ComboboxItem) => {
        const newEpic = item.id === 'no-epic' ? null : Number(item.id)

        if (!modalItem) {
            ToastMessage('Failed to find task')
            return
        }

        try {
            await db.tasks.update(Number(modalItem.id), {
                [TASK_EPIC]: newEpic,
            })

            if (searchParams.get('epic_id')) {
                route(setSearchParams, 'epic_id', newEpic)
            }
        } catch (e) {
            ToastMessage('Failed to delete list')
        }
    }

    return (
        <ComboboxPopover
            items={epicItems}
            onSelect={onEpicConfirm}
            extraOption={{ id: 'no-epic', name: 'No Epic' }}
        >
            <div>
                {modalItem.epic ? (
                    <div className={styles.epicSet}>
                        {modalItem?.epic?.name}
                    </div>
                ) : (
                    <div className={styles.epicEmpty}>
                        Add to epic
                    </div>
                )}
            </div>
        </ComboboxPopover>
    )
}

export default EpicBadge
