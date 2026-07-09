import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { sets } from '../data/sets'
import { SetSection } from '../components/SetSection'
import { SiblingNav } from '../components/SiblingNav'

export function SetDetailPage() {
  const { setId } = useParams<{ setId: string }>()
  const set = sets.find((s) => s.id === setId)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [setId])

  if (!set) {
    return (
      <div className="empty-state">
        <h2>No data at this address</h2>
        <Link to="/" className="back-link">
          &larr; Back to index
        </Link>
      </div>
    )
  }

  if (set.seriesId) {
    return <Navigate to={`/series/${set.seriesId}#${set.id}`} replace />
  }

  return (
    <div className="binder-page">
      <Link to="/" className="back-link">
        &larr; Back to index
      </Link>
      <SiblingNav setId={set.id} />
      <SetSection set={set} />
    </div>
  )
}
