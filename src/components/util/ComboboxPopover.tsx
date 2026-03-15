import * as Popover from '@radix-ui/react-popover'
import { useRef, useState } from 'react'
import styles from './ComboboxPopover.module.scss'

export interface ComboboxItem {
    id: number | string | null
    name: string
}

interface ComboboxPopoverProps {
    /** The element that triggers the popover — receives Radix's onClick/data-state via asChild */
    children: React.ReactElement
    items: ComboboxItem[]
    onSelect: (item: ComboboxItem) => void
    /** Optional item rendered at the top of the list before the filtered items */
    extraOption?: ComboboxItem
}

function ChevronUpDown() {
    return (
        <svg className={styles.chevron} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
            />
        </svg>
    )
}

export function ComboboxPopover({
    children,
    items,
    onSelect,
    extraOption,
}: ComboboxPopoverProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const filtered = items.filter(
        (item) =>
            query === '' ||
            item.name
                .toLowerCase()
                .replace(/\s+/g, '')
                .includes(query.toLowerCase().replace(/\s+/g, ''))
    )

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) setQuery('')
        setOpen(newOpen)
    }

    const handleSelect = (item: ComboboxItem) => {
        onSelect(item)
        handleOpenChange(false)
    }

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={styles.content}
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault()
                        inputRef.current?.focus()
                    }}
                >
                    <div className={styles.inputRow}>
                        <input
                            ref={inputRef}
                            className={styles.input}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                        />
                        <span className={styles.chevronWrap} aria-hidden="true">
                            <ChevronUpDown />
                        </span>
                    </div>
                    <ul className={styles.list}>
                        {extraOption && (
                            <li
                                className={styles.option}
                                onClick={() => handleSelect(extraOption)}
                            >
                                {extraOption.name}
                            </li>
                        )}
                        {filtered.length === 0 && query !== '' ? (
                            <li className={styles.empty}>Nothing found.</li>
                        ) : (
                            filtered.map((item) => (
                                <li
                                    key={String(item.id ?? 'null')}
                                    className={styles.option}
                                    onClick={() => handleSelect(item)}
                                >
                                    {item.name}
                                </li>
                            ))
                        )}
                    </ul>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

export default ComboboxPopover
