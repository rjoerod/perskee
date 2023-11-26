interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label?: string;
	onClick?: () => void;
	size?: string;
}

const Button = ({
	label,
	onClick = () => {},
	size,
	children,
	className,
	...props
}: ButtonProps) => {
	return (
		<button
			type="button"
			className={`py-2 px-3 h-min w-full ring-1 ring-slate-700 bg-transparent hover:bg-slate-700 rounded-lg text-${
				size ?? "sm"
			} ${className ?? ""} ${
				props?.disabled && "hover:bg-transparent cursor-not-allowed"
			}`}
			onClick={onClick}
			{...props}
		>
			{label ?? children}
		</button>
	);
};

export default Button;
