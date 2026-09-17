import { useEffect, useState } from 'react'
import type { InstallAdvice } from '../../core/install'
import { currentAdvice, onInstallChange } from '../../platform/install'

/**
 * What we should say about installing, kept current.
 *
 * It can change after the first render: Chrome often hands over its install
 * prompt a moment later, and it withdraws it once the app is installed.
 *
 * This lives in a hook rather than inside the banner so the screen can ask the
 * question before deciding what to show. The banner rendering nothing when
 * there is nothing to say would otherwise still take up its turn, and the
 * reminder queued behind it would never appear.
 */
export function useInstallAdvice(): InstallAdvice {
  const [advice, setAdvice] = useState(currentAdvice)
  useEffect(() => onInstallChange(() => setAdvice(currentAdvice())), [])
  return advice
}
