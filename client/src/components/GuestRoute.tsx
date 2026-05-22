import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

type Props = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: Props) {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}