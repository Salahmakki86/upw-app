/**
 * ConflictResolver — Wave 7 Advanced
 *
 * Surfaces unresolved entries from state.conflictLog (populated by
 * smartMerge in AppContext when two devices wrote conflicting values to
 * the same user-authored text field). User can pick which value to keep
 * per-entry; the chosen value is written back to state and the conflict
 * entry is removed.
 *
 * Renders nothing when there are no conflicts.
 */
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const FIELD_LABELS = {
  userName:           { ar: 'الاسم',        en: 'Name' },
  identityStatement:  { ar: 'بيان الهوية',   en: 'Identity statement' },
  morningCommitment:  { ar: 'التزام الصباح', en: 'Morning commitment' },
}

export default function ConflictResolver() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const [dismissed, setDismissed] = useState(false)

  const conflicts = useMemo(() => state.conflictLog || [], [state.conflictLog])
  if (dismissed) return null
  if (conflicts.length === 0) return null

  const resolve = (conflict, pick) => {
    const chosenValue = pick === 'local' ? conflict.localValue : conflict.remoteValue
    // Apply chosen value to the conflicting field
    update(conflict.field, chosenValue)
    // Remove this conflict from the log
    const nextLog = conflicts.filter(c => c.id !== conflict.id)
    update('conflictLog', nextLog)
    showToast(
      isAr ? 'تم حفظ الاختيار ✓' : 'Choice saved ✓',
      'success', 1500
    )
  }

  const dismissAll = () => {
    update('conflictLog', [])
    setDismissed(true)
    showToast(
      isAr ? 'تم مسح التعارضات' : 'Conflicts cleared',
      'info', 1500
    )
  }

  return (
    <div
      role="dialog"
      aria-label={isAr ? 'حل تعارضات المزامنة' : 'Resolve sync conflicts'}
      style={{
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 14,
        background: 'linear-gradient(135deg, rgba(243,156,18,0.08), rgba(243,156,18,0.02))',
        border: '1px solid rgba(243,156,18,0.3)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#f39c12' }}>
              {isAr ? 'تعارض مزامنة' : 'Sync Conflict'}
            </div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
              {isAr
                ? 'قمت بتحرير هذه الحقول على جهازين مختلفين. اختر القيمة التي ترغب بالاحتفاظ بها:'
                : 'You edited these fields on two different devices. Pick which value to keep:'}
            </div>
          </div>
        </div>
        <button
          onClick={dismissAll}
          aria-label={isAr ? 'تجاهل الكل' : 'Dismiss all'}
          style={{
            background: 'transparent', border: 'none', color: '#666',
            fontSize: 16, cursor: 'pointer', flexShrink: 0, lineHeight: 1,
          }}
        >×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {conflicts.map((c) => {
          const label = FIELD_LABELS[c.field] || { ar: c.field, en: c.field }
          return (
            <div key={c.id}
              style={{
                borderRadius: 10,
                padding: 10,
                background: '#111',
                border: '1px solid #222',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
                {isAr ? label.ar : label.en}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => resolve(c, 'local')}
                  className="active:scale-[0.98] transition-all"
                  style={{
                    textAlign: isAr ? 'right' : 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#151515',
                    border: '1px solid #2a2a2a',
                    color: '#ddd',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 9, color: '#888', display: 'block', marginBottom: 2 }}>
                    {isAr ? 'هذا الجهاز' : 'This device'}
                  </span>
                  <span style={{ fontWeight: 700 }}>{c.localValue}</span>
                </button>
                <button
                  onClick={() => resolve(c, 'remote')}
                  className="active:scale-[0.98] transition-all"
                  style={{
                    textAlign: isAr ? 'right' : 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#151515',
                    border: '1px solid #2a2a2a',
                    color: '#ddd',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 9, color: '#888', display: 'block', marginBottom: 2 }}>
                    {isAr ? 'الجهاز الآخر' : 'Other device'}
                  </span>
                  <span style={{ fontWeight: 700 }}>{c.remoteValue}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
