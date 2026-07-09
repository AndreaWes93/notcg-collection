import { Link } from 'react-router-dom'
import { getSiblingNav } from '../lib/collectionOrder'

type SiblingNavProps = {
  setId: string
}

export function SiblingNav({ setId }: SiblingNavProps) {
  const { prev, next } = getSiblingNav(setId)
  if (!prev && !next) return null

  return (
    <nav className="sibling-nav" aria-label="Adjacent sets">
      {prev ? (
        <Link to={prev.to} className="sibling-nav-link sibling-nav-prev">
          <span className="sibling-nav-arrow" aria-hidden="true">
            &larr;
          </span>
          <span className="sibling-nav-label">{prev.label}</span>
        </Link>
      ) : (
        <span className="sibling-nav-link sibling-nav-disabled" aria-hidden="true" />
      )}
      {next ? (
        <Link to={next.to} className="sibling-nav-link sibling-nav-next">
          <span className="sibling-nav-label">{next.label}</span>
          <span className="sibling-nav-arrow" aria-hidden="true">
            &rarr;
          </span>
        </Link>
      ) : (
        <span className="sibling-nav-link sibling-nav-disabled" aria-hidden="true" />
      )}
    </nav>
  )
}
