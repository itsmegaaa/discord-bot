import { createBrowserRouter, Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Terms from '../pages/Terms.jsx';
import Privacy from '../pages/Privacy.jsx';
import ServerList from '../pages/ServerList.jsx';
import Welcome from '../pages/dashboard/Welcome.jsx';
import Leveling from '../pages/dashboard/Leveling.jsx';
import Moderation from '../pages/dashboard/Moderation.jsx';
import AutoMod from '../pages/dashboard/AutoMod.jsx';
import Logging from '../pages/dashboard/Logging.jsx';
import Giveaway from '../pages/dashboard/Giveaway.jsx';
import Birthday from '../pages/dashboard/Birthday.jsx';
import CustomCommands from '../pages/dashboard/CustomCommands.jsx';
import Insights from '../pages/dashboard/Insights.jsx';
import Modules from '../pages/dashboard/Modules.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import LoadingSkeleton from '../components/shared/LoadingSkeleton.jsx';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSkeleton />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireGuild() {
  const { guildId } = useParams();
  const { guilds, loading } = useAuth();
  if (loading) return <LoadingSkeleton />;
  return guilds.some((guild) => guild.id === guildId)
    ? <PageWrapper><Outlet /></PageWrapper>
    : <Navigate to="/servers" replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/terms', element: <Terms /> },
  { path: '/privacy', element: <Privacy /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/servers', element: <ServerList /> },
      {
        path: '/dashboard/:guildId',
        element: <RequireGuild />,
        children: [
          { index: true, element: <Navigate to="welcome" replace /> },
          { path: 'modules', element: <Modules /> },
          { path: 'welcome', element: <Welcome /> },
          { path: 'leveling', element: <Leveling /> },
          { path: 'moderation', element: <Moderation /> },
          { path: 'automod', element: <AutoMod /> },
          { path: 'logging', element: <Logging /> },
          { path: 'giveaway', element: <Giveaway /> },
          { path: 'birthday', element: <Birthday /> },
          { path: 'commands', element: <CustomCommands /> },
          { path: 'insights', element: <Insights /> },
        ],
      },
    ],
  },
]);
