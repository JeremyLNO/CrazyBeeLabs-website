export function Hex({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#f5b400"
      stroke="#080808"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path d="M12 3l7.79 4.5v9L12 21l-7.79-4.5v-9z" />
    </svg>
  );
}
