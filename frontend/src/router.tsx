import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { ADMIN_PATH } from '@/config'

const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/Login'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const ProjectList = lazy(() => import('@/pages/ProjectList'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const ProjectUpload = lazy(() => import('@/pages/ProjectUpload'))
const ProjectEdit = lazy(() => import('@/pages/ProjectEdit'))
const MyProjects = lazy(() => import('@/pages/MyProjects'))
const Chat = lazy(() => import('@/pages/Chat'))

const AdminPendingList = lazy(() => import('@/pages/admin/AdminPendingList'))
const AdminReview = lazy(() => import('@/pages/admin/AdminReview'))
const AdminStats = lazy(() => import('@/pages/admin/AdminStats'))
const AdminMetadata = lazy(() => import('@/pages/admin/AdminMetadata'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'projects', element: <ProjectList /> },
      { path: 'projects/:id', element: <ProjectDetail /> },

      // USER 이상 접근 가능
      {
        element: <RequireAuth role="USER" />,
        children: [
          { path: 'projects/new', element: <ProjectUpload /> },
          { path: 'projects/:id/edit', element: <ProjectEdit /> },
          { path: 'my-projects', element: <MyProjects /> },
          { path: 'chat', element: <Chat /> },
        ],
      },

      // ADMIN 전용
      {
        path: ADMIN_PATH,
        element: <RequireAuth role="ADMIN" />,
        children: [
          { index: true, element: <AdminPendingList /> },
          { path: 'review/:id', element: <AdminReview /> },
          { path: 'stats', element: <AdminStats /> },
          { path: 'metadata', element: <AdminMetadata /> },
        ],
      },
    ],
  },
])

export default router
