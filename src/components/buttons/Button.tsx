import { MouseEventHandler } from 'react'
import styles from './Button.module.scss'

const SIZE_CLASS: Record<string, string> = {
    sm: styles.textSm,
    base: styles.textBase,
    lg: styles.textLg,
    xl: styles.textXl,
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string
    onClick?: MouseEventHandler<HTMLButtonElement>
    size?: string
}

const Button = ({
    label,
    onClick = () => {},
    size,
    children,
    className,
    ...props
}: ButtonProps) => {
    const sizeClass = SIZE_CLASS[size ?? 'sm'] ?? styles.textSm
    return (
        <button
            type="button"
            className={[styles.btn, sizeClass, className ?? ''].join(' ')}
            onClick={onClick}
            {...props}
        >
            {label ?? children}
        </button>
    )
}

export default Button
