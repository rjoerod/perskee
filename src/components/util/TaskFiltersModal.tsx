import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { route } from '../../util/queryRouting'
import Button from '../buttons/Button'
import styles from './TaskFiltersModal.module.scss'

interface GenericFilterProps {
    title: string
    state: string
    updateRoute: (s: string) => void
    updateState: (s: string) => void
}

const GenericFilter = ({
    title,
    state,
    updateRoute,
    updateState,
}: GenericFilterProps) => {
    return (
        <div className={styles.filterSection}>
            <div className={styles.filterTitle}>{title}</div>
            <div className={styles.filterContent}>
                <input
                    className={styles.filterInput}
                    onChange={(e) => {
                        updateState(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateRoute(state)
                        }
                    }}
                    value={state}
                />
                <div className={styles.filterButtons}>
                    <Button
                        onClick={() => {
                            updateState('')
                            updateRoute('')
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => {
                            updateRoute(state)
                        }}
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    )
}

const TitleFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const titleParam = searchParams?.get('title') ?? ''
    const [title, setTitle] = useState(titleParam ?? '')

    return (
        <GenericFilter
            title="Filter By Title"
            state={title}
            updateRoute={(title: string) =>
                route(setSearchParams, 'title', title)
            }
            updateState={setTitle}
        />
    )
}

const DescriptionFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const descriptionParam = searchParams?.get('description') ?? ''
    const [description, setDescription] = useState(descriptionParam ?? '')

    return (
        <GenericFilter
            title="Filter By Description"
            state={description}
            updateRoute={(description: string) =>
                route(setSearchParams, 'description', description)
            }
            updateState={setDescription}
        />
    )
}

const HighlightedTaskFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const higlightedTaskParam = Number(searchParams?.get('highlighted') ?? 0)
    const [isHighlighted, setIsHighlighted] = useState(higlightedTaskParam)

    const updateHighlightedFilter = (val: number) => {
        setIsHighlighted(val)
        route(setSearchParams, 'highlighted', val)
    }

    return (
        <div className={styles.highlightSection}>
            <div className={styles.highlightTitle}>
                Filter By Highlighted
            </div>
            <div className={styles.filterContent}>
                <div className={styles.radioGroup}>
                    <label
                        className={styles.radioLabel}
                        data-active={String(isHighlighted === 0)}
                        onChange={() => updateHighlightedFilter(0)}
                    >
                        <b>OFF</b>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="highlighted"
                            value={isHighlighted}
                            checked={isHighlighted === 0}
                            readOnly
                        />
                    </label>
                    <label
                        className={styles.radioLabel}
                        data-active={String(isHighlighted === 1)}
                        onChange={() => updateHighlightedFilter(1)}
                    >
                        <b>ON</b>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="highlighted"
                            value={isHighlighted}
                            checked={isHighlighted === 1}
                            readOnly
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

const ShowArchivedFilter = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const showArchivedParam = Number(searchParams?.get('show_archived') ?? 0)
    const [showArchived, setShowArchived] = useState(showArchivedParam)

    const updateShowArchivedFilter = (val: number) => {
        setShowArchived(val)
        route(setSearchParams, 'show_archived', val)
    }

    return (
        <div className={styles.highlightSection}>
            <div className={styles.highlightTitle}>Show Archived Cards</div>
            <div className={styles.filterContent}>
                <div className={styles.radioGroup}>
                    <label
                        className={styles.radioLabel}
                        data-active={String(showArchived === 0)}
                        onChange={() => updateShowArchivedFilter(0)}
                    >
                        <b>OFF</b>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="show_archived"
                            value={showArchived}
                            checked={showArchived === 0}
                            readOnly
                        />
                    </label>
                    <label
                        className={styles.radioLabel}
                        data-active={String(showArchived === 1)}
                        onChange={() => updateShowArchivedFilter(1)}
                    >
                        <b>ON</b>
                        <input
                            className={styles.radioInput}
                            type="radio"
                            name="show_archived"
                            value={showArchived}
                            checked={showArchived === 1}
                            readOnly
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

interface TaskFiltersModalProps {
    open: boolean
    onClose: () => void
}

const TaskFiltersModal = ({ open, onClose }: TaskFiltersModalProps) => {
    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay}>
                    <Dialog.Content className={styles.panel} aria-describedby={undefined}>
                        <Dialog.Title className={styles.title}>
                            Task Filters
                        </Dialog.Title>
                        <TitleFilter />
                        <DescriptionFilter />
                        <HighlightedTaskFilter />
                        <ShowArchivedFilter />
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default TaskFiltersModal
