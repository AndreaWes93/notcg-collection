import { Route, Routes, Link } from 'react-router-dom'
import { SetsListPage } from './pages/SetsListPage'
import { SetDetailPage } from './pages/SetDetailPage'
import { SeriesDetailPage } from './pages/SeriesDetailPage'
import { SignalDot } from './components/SignalDot'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          <SignalDot pulse />
          <span className="app-title-text">
            <span className="app-title-main">Pokémon No-TCG</span>
            <span className="app-title-sub">Collection log</span>
          </span>
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SetsListPage />} />
          <Route path="/sets/:setId" element={<SetDetailPage />} />
          <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
