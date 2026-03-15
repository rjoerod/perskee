import { MouseEventHandler } from 'react'
import styles from './Button.module.css'
import shared from '../../styles/shared.module.css'

const SIZE_CLASS: Record<string, string> = {
    sm: shared.textSm,
    base: shared.textBase,
    lg: shared.textLg,
    xl: shared.textXl,
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
    const sizeClass = SIZE_CLASS[size ?? 'sm'] ?? shared.textSm
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
