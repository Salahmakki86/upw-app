/**
 * SettingsPage — User preferences + Data management
 *
 * Sections:
 *  • Display: Focus Mode, Identity Anchor toggle, reduced-motion
 *  • Feature Flags: enable/disable experimental features
 *  • Data: Export JSON, Print Monthly Journal, Import JSON
 *  • Privacy: Clear local data (after confirm)
 */
import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { downloadJson, printMonthlyJournal } from '../utils/pdfExport'

const FEATURE_FLAGS = [
  { key: 'identityAnchor', ar: 'مرساة الهوية', en: 'Identity Anchor', defaultOn: true,
    descAr: 'شريط أعلى كل صفحة يُظهر هويتك اليومية', descEn: 'Bar on every page showing your daily identity' },
  { key: 'triadReset',     ar: 'إعادة ضبط الحالة', en: 'Triad Reset', defaultOn: true,
    descAr: 'زر عائم لإعادة ضبط الحالة في 60 ثانية', descEn: 'Floating button for 60-sec state reset' },
  { key: 'focusMode',      ar: 'وضع التركيز', en: 'Focus Mode', defaultOn: false,
    descAr: 'يبسّط الرئيسية لإظهار مهمة اليوم فقط', descEn: 'Simplify dashboard to today-only' },
  { key: 'journey90',      ar: 'رحلة 90 يوم', en: '90-Day Journey', defaultOn: true,
    descAr: 'تفعيل مسار التحوّل 90 يوم', descEn: 'Enable 90-day transformation path' },
  { key: 'voiceJournal',   ar: 'يوميات صوتية', en: 'Voice Journal', defaultOn: true,
    descAr: 'تسجيل صوتي للتأمل اليومي', descEn: 'Voice-based daily reflection' },
  { key: 'aiCoach',        ar: 'المدرب الذكي', en: 'AI Coach', defaultOn: false,
    descAr: 'محادثة تدريبية (تجريبية)', descEn: 'Coaching chat (experimental)' },
]

export default function SettingsPage() {
  const { state, updateUIPref, toggleFeatureFlag, mergeImportedState, logDataExport } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const ui = state.uiPreferences || {}
  const flags = state.featureFlags || {}
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    const filename = `upw-backup-${stamp}.json`
    const meta = downloadJson(filename, {
      exportedAt: new Date().toISOString(),
      version: 1,
      state,
    })
    logDataExport({ filename, size: meta.size, type: 'json' })
    showToast(isAr ? 'تم التصدير ✓' : 'Exported ✓', 'success', 2000)
  }

  const handlePrint = () => {
    const monthKey = new Date().toISOString().slice(0, 7)
    printMonthlyJournal(state, isAr, monthKey)
    logDataExport({ monthKey, type: 'pdf' })
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const payload = parsed.state || parsed
        if (!confirm(isAr
          ? 'سيتم دمج البيانات المستوردة مع بياناتك الحالية. متابعة؟'
          : 'This will merge imported data with your current data. Continue?'
        )) return
        mergeImportedState(payload)
        showToast(isAr ? 'تم الاستيراد ✓' : 'Imported ✓', 'success', 2000)
      } catch {
        showToast(isAr ? 'ملف غير صالح' : 'Invalid file', 'error', 2000)
      }
      // reset input so re-uploading same file works
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <Layout
      title={isAr ? '⚙️ الإعدادات' : '⚙️ Settings'}
      subtitle={isAr ? 'الميزات، البيانات، والخصوصية' : 'Features, data & privacy'}
    >
      <div className="space-y-4 pt-2">

        {/* Display preferences */}
        <Section title={isAr ? '🎨 العرض' : '🎨 Display'}>
          <Toggle
            label={isAr ? 'مرساة الهوية' : 'Identity Anchor'}
            desc={isAr ? 'إخفاء شريط الهوية من أعلى كل صفحة' : 'Hide the identity bar at the top of each page'}
            value={!ui.identityAnchorHidden}
            onChange={v => updateUIPref('identityAnchorHidden', !v)}
          />
          <Toggle
            label={isAr ? 'وضع التركيز' : 'Focus Mode'}
            desc={isAr ? 'بسّط الرئيسية إلى مهمة اليوم الأساسية فقط' : 'Simplify home to only today\'s primary task'}
            value={!!ui.focusMode}
            onChange={v => updateUIPref('focusMode', v)}
          />
          <Toggle
            label={isAr ? 'تقليل الحركة' : 'Reduced motion'}
            desc={isAr ? 'تقليل التأثيرات الحركية للوضوح' : 'Dim animations for clarity'}
            value={!!ui.reducedMotion}
            onChange={v => updateUIPref('reducedMotion', v)}
          />
        </Section>

        {/* Feature flags */}
        <Section title={isAr ? '🧪 ميزات متقدمة' : '🧪 Advanced Features'}>
          {FEATURE_FLAGS.map(f => {
            const on = flags[f.key] != null ? !!flags[f.key] : f.defaultOn
            return (
              <Toggle
                key={f.key}
                label={isAr ? f.ar : f.en}
                desc={isAr ? f.descAr : f.descEn}
                value={on}
                onChange={() => toggleFeatureFlag(f.key)}
              />
            )
          })}
        </Section>

        {/* Data export/import */}
        <Section title={isAr ? '💾 البيانات' : '💾 Data'}>
          <DataRow
            emoji="📥"
            title={isAr ? 'تصدير بياناتي (JSON)' : 'Export my data (JSON)'}
            desc={isAr ? 'ملف نسخ احتياطي كامل' : 'Full backup file'}
            onClick={handleExport}
          />
          <DataRow
            emoji="📄"
            title={isAr ? 'طباعة مفكرة الشهر' : 'Print monthly journal'}
            desc={isAr ? 'صفحة قابلة للطباعة/PDF' : 'Print-ready / PDF'}
            onClick={handlePrint}
          />
          <DataRow
            emoji="📤"
            title={isAr ? 'استيراد من ملف JSON' : 'Import from JSON'}
            desc={isAr ? 'دمج مع بياناتك الحالية' : 'Merge with current data'}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          {Array.isArray(state.dataExports) && state.dataExports.length > 0 && (
            <p style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
              {isAr
                ? `آخر تصدير: ${new Date(state.dataExports[state.dataExports.length - 1].ts).toLocaleString('ar')}`
                : `Last export: ${new Date(state.dataExports[state.dataExports.length - 1].ts).toLocaleString()}`}
            </p>
          )}
        </Section>

        {/* Notification Preferences link */}
        <Section title={isAr ? '🔔 الإشعارات' : '🔔 Notifications'}>
          <a href="/notifications-prefs" style={{ textDecoration: 'none' }}>
            <DataRow
              emoji="⚙️"
              title={isAr ? 'تفضيلات الإشعارات' : 'Notification preferences'}
              desc={isAr ? 'المواعيد، القنوات، التواتر' : 'Timing, channels, frequency'}
              onClick={() => {}}
            />
          </a>
        </Section>

        {/* Account / Version */}
        <Section title={isAr ? 'ℹ️ عن التطبيق' : 'ℹ️ About'}>
          <div style={{ padding: '12px 14px', background: '#141414', borderRadius: 10, border: '1px solid #222' }}>
            <p style={{ fontSize: 11, color: '#bbb' }}>
              {isAr ? 'تطبيق قواك — PWA' : 'Your Power App — PWA'}
            </p>
            <p style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
              {isAr ? 'جميع البيانات مخزّنة محلياً ومزامنة آمنة' : 'All data stored locally with secure sync'}
            </p>
          </div>
        </Section>
      </div>
    </Layout>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 8 }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </section>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div
      role="switch"
      aria-checked={value}
      tabIndex={0}
      onClick={() => onChange(!value)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!value) } }}
      style={{
        padding: '12px 14px', background: '#0e0e0e',
        border: `1px solid ${value ? 'rgba(201,168,76,0.25)' : '#1e1e1e'}`,
        borderRadius: 12, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{label}</p>
        <p style={{ fontSize: 10, color: '#888', marginTop: 2, lineHeight: 1.3 }}>{desc}</p>
      </div>
      <div style={{
        width: 42, height: 24, borderRadius: 12,
        background: value ? 'rgba(201,168,76,0.4)' : '#222',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: 2,
          insetInlineStart: value ? 20 : 2,
          width: 20, height: 20, borderRadius: '50%',
          background: value ? '#c9a84c' : '#555',
          transition: 'inset-inline-start 0.2s, background 0.2s',
        }}/>
      </div>
    </div>
  )
}

function DataRow({ emoji, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-start transition-all active:scale-[0.98]"
      style={{
        width: '100%', padding: '12px 14px',
        background: '#0e0e0e', border: '1px solid #1e1e1e',
        borderRadius: 12, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{title}</p>
        <p style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{desc}</p>
      </div>
      <span style={{ color: '#666' }}>→</span>
    </button>
  )
}
