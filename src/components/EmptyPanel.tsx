import type { ReactNode } from 'react'

export function EmptyPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="empty-panel"><h2>{title}</h2><p>{children}</p></section>
}
