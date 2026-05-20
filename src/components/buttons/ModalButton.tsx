import { useEffect, useRef, useState } from 'react'
import Button from '../buttons/Button'
import styles from './ModalButton.module.scss'

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

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
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
                    className={styles.form}
                >
                    <input
                        autoFocus
                        name="name"
                        className={styles.input}
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                const form = e.currentTarget.form
                                if (form) {
                                    form.requestSubmit()
                                }
                            }
                        }}
                    />
                    <div className={styles.buttonRow}>
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
