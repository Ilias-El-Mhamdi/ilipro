interface Props {
  message: string;
  className?: string;
}

export function EmptyText({ message, className = 'text-gray-500' }: Props) {
  return <p className={className}>{message}</p>;
}
