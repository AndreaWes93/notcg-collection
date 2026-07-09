import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { sets } from '../data/sets'
import { useOwnedCards } from '../hooks/useOwnedCards'
import { Gauge } from '../components/Gauge'
import { SignalDot, channelColorForId } from '../components/SignalDot'
import { SetSection } from '../components/SetSection'
import { SiblingNav } from '../components/SiblingNav'
import { yearRangeLabel } from '../lib/yearRange'

export function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const { countOwned } = useOwnedCards()
  const location = useLocation()

  const memberSets = useMemo(() => sets.filter((set) => set.seriesId === seriesId), [seriesId])

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0)
      return
    }
    const id = location.hash.slice(1)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash, seriesId, memberSets.length])

  if (memberSets.length === 0) {
    return (
      <div className="empty-state">
        <h2>No data at this address</h2>
        <Link to="/" className="back-link">
          &larr; Back to index
        </Link>
      </div>
    )
  }

  const seriesName = memberSets[0].seriesName ?? seriesId ?? ''
  const seriesYear = yearRangeLabel(memberSets)
  const totalCards = memberSets.reduce((sum, set) => sum + set.cards.length, 0)
  const totalOwned = memberSets.reduce((sum, set) => sum + countOwned(set.cards.map((card) => card.id)), 0)

  return (
    <div className="binder-page">
      <Link to="/" className="back-link">
        &larr; Back to index
      </Link>
      <SiblingNav setId={memberSets[0].id} />

      <div className="binder-page-header">
        <h2>
          <SignalDot color={channelColorForId(seriesId ?? '')} />
          <span className="panel-header-name">{seriesName}</span>
        </h2>
        {seriesYear && <span className="panel-year">{seriesYear}</span>}
        <Gauge current={totalOwned} total={totalCards} />
      </div>

      <div className="series-sections">
        {memberSets.map((set) => (
          <SetSection key={set.id} set={set} />
        ))}
      </div>
    </div>
  )
}
