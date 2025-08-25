import { UniqueIdentifier } from '@dnd-kit/core'
import Skeleton from 'react-loading-skeleton'
import { Task } from '../../util/types'
import { useEpics } from '../../util/util'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'

const Filters = ({
    epicFilterIds,
}: {
    epicFilterIds: UniqueIdentifier[] | null
}) => {
    const [_, setSearchParams] = useSearchParams()

    const data = useEpics()

    const skeletonClassName =
        'text-slate-400 border-slate-800 font-semibold pl-6 py-4 border-l-4'

    const getTextColor = (task: Task) => {
        if (epicFilterIds?.includes(Number(task.id))) {
            return 'text-sky-500 hover:text-sky-300 border-sky-500'
        }

        if (task.is_highlighted) {
            return 'text-indigo-400 hover:text-indigo-300 border-slate-800'
        }

        return 'text-slate-400 hover:text-slate-300 border-slate-800'
    }

    return (
        <div className="px-9 py-4 h-[calc(100vh-27rem)]">
            <div className="py-4 text-lg font-semibold">Filter By Epic</div>
            <div className="flex flex-col grow h-[calc(100vh-34rem)] overflow-auto pb-8 bl border-slate-800 select-none">
                {data?.tasks ? (
                    data.tasks.map((task: Task) => {
                        return (
                            <div
                                key={task.id}
                                className={`${getTextColor(
                                    task
                                )} font-semibold pl-6 py-4 cursor-pointer border-l-4`}
                                onClick={() => {
                                    const newEpicId = !epicFilterIds?.includes(
                                        Number(task.id)
                                    )
                                        ? Number(task.id)
                                        : null
                                    route(
                                        setSearchParams,
                                        'epic_id',
                                        newEpicId,
                                        true,
                                        task.id
                                    )
                                }}
                            >
                                {task.name}
                            </div>
                        )
                    })
                ) : (
                    <Skeleton
                        baseColor="#0f172a"
                        highlightColor="#1e293b"
                        className={skeletonClassName}
                        count={7}
                    />
                )}
            </div>
        </div>
    )
}

export default Filters
