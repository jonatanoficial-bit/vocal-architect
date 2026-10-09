type IconName = 'audio' | 'harmony' | 'melody'

type Props = { name: IconName }

export function StudioIcon({ name }: Props) {
  if (name === 'audio') return <svg aria-hidden="true" className="studio-icon" viewBox="0 0 24 24"><path d="M4 12h2l2-6 4 12 3-8 1 2h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
  if (name === 'melody') return <svg aria-hidden="true" className="studio-icon" viewBox="0 0 24 24"><path d="M15 4v10.2a3.2 3.2 0 1 1-2-3V7l7-2v8.2a3.2 3.2 0 1 1-2-3V3z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
  return <svg aria-hidden="true" className="studio-icon" viewBox="0 0 24 24"><path d="M5 7v10M10 5v14M15 7v10M20 5v14M5 9h15M5 15h15" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
}
