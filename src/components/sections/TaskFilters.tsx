import { useSearchParams } from 'react-router-dom'
import Button from '../buttons/Button'
import { route } from '../../util/queryRouting'

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
        <div className="px-9 py-8 border-t border-t-slate-700 flex flex-col gap-6">
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
