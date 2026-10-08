import { useState } from 'react'

type CapabilityState = 'checking' | 'ready' | 'limited'
type CaptureCapableNavigator = { mediaDevices?: { getUserMedia?: unknown } }

export function CapabilityStatus() {
  const [state] = useState<CapabilityState>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'checking'
    const browserNavigator = navigator as unknown as CaptureCapableNavigator
    return window.isSecureContext && typeof browserNavigator.mediaDevices?.getUserMedia === 'function' ? 'ready' : 'limited'
  })

  if (state === 'checking') return <div className="capability-status loading" role="status">Verificando compatibilidade do navegador…</div>
  if (state === 'ready') return <div className="capability-status ready" role="status">Ambiente preparado para gravação. A permissão só será solicitada quando você iniciar uma captura.</div>
  return <div className="capability-status limited" role="status">Este ambiente não declara todos os requisitos de captura. Nenhuma permissão de microfone foi solicitada.</div>
}
