import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layouts
import DeveloperLayout from './layouts/DeveloperLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import WorkflowsPage from './pages/WorkflowsPage'
import WorkflowEditorPage from './pages/WorkflowEditorPage'
import AgentsPage from './pages/AgentsPage'
import AgentEditorPage from './pages/AgentEditorPage'
import DeploymentPage from './pages/DeploymentPage'
import TestingPage from './pages/TestingPage'
import LogsPage from './pages/LogsPage'
import SettingsPage from './pages/SettingsPage'

// Store
import { useAuthStore } from './stores/authStore'
import { useEnvironmentStore } from './stores/environmentStore'

function App() {
  const { isAuthenticated, checkAuth, loading } = useAuthStore()
  const { currentEnvironment, fetchEnvironments } = useEnvironmentStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkAuth()
    fetchEnvironments()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <i className="fas fa-code fa-spin"></i>
          <h2>Developer Hub</h2>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          }
        }}
      />

      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />
        </Route>

        {/* Protected Routes */}
        <Route element={
          isAuthenticated ? <DeveloperLayout /> : <Navigate to="/login" replace />
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/workflows/:id/edit" element={<WorkflowEditorPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id/edit" element={<AgentEditorPage />} />
          <Route path="/deployment" element={<DeploymentPage />} />
          <Route path="/testing" element={<TestingPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
