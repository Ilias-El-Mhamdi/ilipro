import { Link } from 'react-router-dom';

interface Props {
  to: string;
  label: string;
}

export function BackLink({ to, label }: Props) {
  return (
    <div className="mb-2">
      <Link to={to} className="text-gray-500 hover:text-gray-300 text-sm">
        ← {label}
      </Link>
    </div>
  );
}
