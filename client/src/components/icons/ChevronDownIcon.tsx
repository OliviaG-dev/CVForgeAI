interface ChevronDownIconProps {
  className?: string;
  size?: number;
  open?: boolean;
}

export default function ChevronDownIcon({ className, size = 20, open = false }: ChevronDownIconProps) {
  return (
    <span
      className={className}
      aria-hidden
      data-open={open}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={size}
        height={size}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}
