import { Task } from '../../../util/types'
import styles from './ListBadge.module.scss'

interface ListBadgeProps {
    modalItem: Task
}

const ListBadge = ({ modalItem }: ListBadgeProps) => {
    return (
        <div>
            <div>
                <div className={styles.badge}>
                    {modalItem.list_name}
                </div>
            </div>
        </div>
    )
}

export default ListBadge
