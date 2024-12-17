import { useEffect, useRef, useState } from 'react'
import Button from '../buttons/Button'
import { idiotsAtHeadlessUI } from '../../util/util'

interface ModalButtonProps {
    initialLabel: string
    confirmLabel: string
    placeholder: string
    handleSubmit: (name: string) => Promise<void>
}

const ModalButton = ({
    initialLabel,
    confirmLabel,
    placeholder,
    handleSubmit,
}: ModalButtonProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [isActive, setIsActive] = useState(false)

    const handleClickOutside = (event: MouseEvent) => {
        if (
            wrapperRef.current &&
            !wrapperRef.current.contains(event?.target as Node)
        ) {
            setIsActive(false)
        }
    }

    useEffect(() => {
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleKeyDown = (e: {
        code: string
        stopPropagation: () => void
        key: string
    }) => {
        idiotsAtHeadlessUI(e)
        if (e.key === 'Enter') {
            e.stopPropagation()
        }
    }

    return (
        <div className="h-min" ref={wrapperRef}>
            {isActive ? (
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const form = e.currentTarget
                        const formData = new FormData(form)
                        const name = formData.get('name')
                        if (name) {
                            await handleSubmit(String(name))
                            setIsActive(false)
                        }
                    }}
                    className="py-3 px-3 h-min bg-slate-800 rounded-lg text-sm"
                >
                    <input
                        autoFocus
                        name="name"
                        className="py-1 px-2 mb-4 border-gray-400 border-2 bg-gray-900 rounded w-full"
                        placeholder={placeholder}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex gap-3">
                        <Button type="submit" label={confirmLabel} />
                        <Button
                            label="Cancel"
                            onClick={() => {
                                setIsActive(false)
                            }}
                        />
                    </div>
                </form>
            ) : (
                <Button
                    label={initialLabel}
                    onClick={() => setIsActive(true)}
                />
            )}
        </div>
    )
}

export default ModalButton
