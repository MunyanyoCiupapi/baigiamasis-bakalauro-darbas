import { Navigate } from 'react-router-dom';
import { getUser, isLoggedIn } from '../utils/auth';

type Props = {
  children: React.ReactNode;
};

export default function ArtistRoute({ children }: Props) {
  const loggedIn = isLoggedIn();
  const user = getUser();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ARTIST') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}