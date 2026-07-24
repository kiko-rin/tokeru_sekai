import { Routes, Route } from 'react-router-dom'
import { TitleBar } from './components/layout/TitleBar'
import { ProjectManager } from './pages/ProjectManager'
import { ProjectView } from './pages/ProjectView'

function App() {
  return (
    <div className="app-layout">
      <TitleBar />
      <Routes>
        <Route path="/" element={<ProjectManager />} />
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </div>
  )
}

export default App
