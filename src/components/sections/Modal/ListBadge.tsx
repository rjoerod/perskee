import { Task } from '../../../util/types'

interface ListBadgeProps {
    modalItem: Task
}

const ListBadge = ({ modalItem }: ListBadgeProps) => {
    return (
        <div>
            <div>
                <div
                    className={
                        'bg-slate-700 ring-1 ring-slate-700 py-[6px] px-3 rounded text-slate-100'
                    }
                >
                    {modalItem.list_name}
                </div>
            </div>
        </div>
    )
}

export default ListBadge
