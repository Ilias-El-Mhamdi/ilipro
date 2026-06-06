interface Props {
  className?: string;
}

export function LoadingText({ className = 'text-gray-500' }: Props) {
  return <p className={className}>Chargement...</p>;
}
