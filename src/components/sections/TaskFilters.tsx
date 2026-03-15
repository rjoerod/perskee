import { useSearchParams } from 'react-router-dom'
import Button from '../buttons/Button'
import { route } from '../../util/queryRouting'
import styles from './TaskFilters.module.scss'

interface TaskFiltersModalProps {
    openModal: () => void
}

const TaskFilters = ({ openModal }: TaskFiltersModalProps) => {
    const [_, setSearchParams] = useSearchParams()

    const resetFilters = () => {
        route(setSearchParams, 'epic_id', '')
        route(setSearchParams, 'title', '')
        route(setSearchParams, 'description', '')
        route(setSearchParams, 'highlighted', 0)
    }

    return (
        <div className={styles.container}>
            <Button size="lg" onClick={openModal}>
                More Filters
            </Button>
            <Button size="lg" onClick={resetFilters}>
                Reset All Filters
            </Button>
        </div>
    )
}

export default TaskFilters
