import { Task } from '../../../util/types'

interface ListBadgeProps {
    modalItem: Task
}

const ListBadge = ({ modalItem }: ListBadgeProps) => {
    return (
        <div
            className={
                'flex gap-[7px] py-[6px] pl-2 pr-3 rounded bg-slate-700 ring-slate-500 text-slate-100'
            }
        >
            <div>{modalItem.list_name}</div>
        </div>
    )
}

export default ListBadge
