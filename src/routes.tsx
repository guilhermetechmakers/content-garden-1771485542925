import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { LandingPage } from '@/pages/landing'
import { HomePage } from '@/pages/home'
import { GardenPage } from '@/pages/garden'
import { CanvasesPage } from '@/pages/canvases'
import { CanvasWorkspacePage } from '@/pages/canvas-workspace'
import { DropsPage } from '@/pages/drops'
import { RunwayPage } from '@/pages/runway'
import { SnippetsPage } from '@/pages/snippets'
import { LibraryPage } from '@/pages/library'
import { SearchPage } from '@/pages/search'
import { LoginPage } from '@/pages/auth/login'
import { SignupPage } from '@/pages/auth/signup'
import { ProfilePage } from '@/pages/profile'
import { AdminPage } from '@/pages/admin'
import { PrivacyPage } from '@/pages/legal/privacy'
import { TermsPage } from '@/pages/legal/terms'
import { NotFoundPage } from '@/pages/legal/not-found'

export const router = createBrowserRouter([
  { path: '/landing', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'garden', element: <GardenPage /> },
      { path: 'canvases', element: <CanvasesPage /> },
      { path: 'canvases/:canvasId', element: <CanvasWorkspacePage /> },
      { path: 'drops', element: <DropsPage /> },
      { path: 'runway', element: <RunwayPage /> },
      { path: 'snippets', element: <SnippetsPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
])
