import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

const ALL_FEATURES = [
  // يومك
  { path: '/today',         emojiAr: '⚡', labelAr: 'يومي الذكي',          labelEn: 'Smart Today',           cat: 'يومك' },
  { path: '/morning',       emojiAr: '☀️', labelAr: 'الروتين الصباحي',      labelEn: 'Morning Ritual',        cat: 'يومك' },
  { path: '/state',         emojiAr: '⚡', labelAr: 'إدارة الحالة',          labelEn: 'State Management',      cat: 'يومك' },
  { path: '/evening',       emojiAr: '🌙', labelAr: 'الروتين المسائي',       labelEn: 'Evening Ritual',        cat: 'يومك' },
  { path: '/wins',          emojiAr: '🏆', labelAr: 'انتصاراتي اليومية',    labelEn: 'Daily Wins',            cat: 'يومك' },
  { path: '/gratitude',     emojiAr: '🙏', labelAr: 'يوميات الامتنان',       labelEn: 'Gratitude Journal',     cat: 'يومك' },
  { path: '/habits',        emojiAr: '✅', labelAr: 'تتبع العادات',           labelEn: 'Habit Tracker',         cat: 'يومك' },
  { path: '/sleep',         emojiAr: '😴', labelAr: 'تتبع النوم',             labelEn: 'Sleep Tracker',         cat: 'يومك' },
  // أهدافك
  { path: '/goals',         emojiAr: '🎯', labelAr: 'الأهداف',               labelEn: 'Goals',                 cat: 'أهدافك' },
  { path: '/wheel',         emojiAr: '🌐', labelAr: 'عجلة الحياة',            labelEn: 'Wheel of Life',         cat: 'أهدافك' },
  { path: '/beliefs',       emojiAr: '💡', labelAr: 'المعتقدات',              labelEn: 'Beliefs',               cat: 'أهدافك' },
  { path: '/destiny',       emojiAr: '🧭', labelAr: 'موعد مع القدر',          labelEn: 'Date with Destiny',     cat: 'أهدافك' },
  { path: '/freedom',       emojiAr: '💰', labelAr: 'الحرية المالية',          labelEn: 'Financial Freedom',     cat: 'أهدافك' },
  { path: '/power30',       emojiAr: '⚡', labelAr: 'القوة الشخصية ٣٠',       labelEn: 'Personal Power 30',     cat: 'أهدافك' },
  { path: '/fear',          emojiAr: '🦁', labelAr: 'من الخوف إلى القوة',    labelEn: 'Fear to Power',         cat: 'أهدافك' },
  { path: '/time',          emojiAr: '⏰', labelAr: 'وقت حياتك',              labelEn: 'Time of Life',          cat: 'أهدافك' },
  // البرامج
  { path: '/energy',        emojiAr: '🔥', labelAr: 'تحدي الطاقة',            labelEn: 'Energy Challenge',      cat: 'البرامج' },
  { path: '/weekly',        emojiAr: '📅', labelAr: 'المراجعة الأسبوعية',     labelEn: 'Weekly Review',         cat: 'البرامج' },
  { path: '/relationships', emojiAr: '❤️', labelAr: 'إتقان العلاقات',         labelEn: 'Relationship Mastery',  cat: 'البرامج' },
  { path: '/modeling',      emojiAr: '👥', labelAr: 'نمذجة التميز',            labelEn: 'Modeling Excellence',   cat: 'البرامج' },
  { path: '/protocol',      emojiAr: '⚗️', labelAr: 'بروتوكول الطاقة',        labelEn: 'Energy Protocol',       cat: 'البرامج' },
  { path: '/challenge',     emojiAr: '🎲', labelAr: 'تحدي يومي',              labelEn: 'Daily Challenge',       cat: 'البرامج' },
  { path: '/group-challenge',emojiAr:'🥊', labelAr: 'تحدي الـ٣٠ يوم',         labelEn: '30-Day Challenge',      cat: 'البرامج' },
  { path: '/commitment',    emojiAr: '📜', labelAr: 'عقد التزامي',             labelEn: 'My Commitment',         cat: 'البرامج' },
  { path: '/letters',       emojiAr: '✉️', labelAr: 'رسائل لنفسي',            labelEn: 'Letters to Self',       cat: 'البرامج' },
  { path: '/library',       emojiAr: '📖', labelAr: 'المكتبة',                 labelEn: 'Library',               cat: 'البرامج' },
  // الأدوات
  { path: '/insights',      emojiAr: '🧠', labelAr: 'تقرير رحلتي',            labelEn: 'My Journey Report',     cat: 'الأدوات' },
  { path: '/baseline',      emojiAr: '📊', labelAr: 'نقطة الانطلاق',           labelEn: 'Baseline Assessment',   cat: 'الأدوات' },
  { path: '/reading',       emojiAr: '📚', labelAr: 'سجل القراءة',             labelEn: 'Reading Log',           cat: 'الأدوات' },
  { path: '/vision',        emojiAr: '🔭', labelAr: 'لوحة الرؤية',             labelEn: 'Vision Board',          cat: 'الأدوات' },
  { path: '/achievements',  emojiAr: '🏅', labelAr: 'الإنجازات',               labelEn: 'Achievements',          cat: 'الأدوات' },
  { path: '/stats',         emojiAr: '📈', labelAr: 'الإحصاءات',               labelEn: 'Statistics',            cat: 'الأدوات' },
  // Admin only
  { path: '/students',      emojiAr: '🎓', labelAr: 'تقدم الطلاب',             labelEn: 'Student Progress',      cat: 'الإدارة', adminOnly: true },
  { path: '/coach-messages',emojiAr: '💬', labelAr: 'رسائل المدرب',            labelEn: 'Coach Messages',        cat: 'الإدارة', adminOnly: true },
  { path: '/weekly-report', emojiAr: '📋', labelAr: 'التقرير الأسبوعي',        labelEn: 'Weekly Report',         cat: 'الإدارة', adminOnly: true },
  { path: '/business',      emojiAr: '💼', labelAr: 'إتقان الأعمال',           labelEn: 'Business Mastery',      cat: 'الإدارة', adminOnly: true },
  { path: '/scaling',       emojiAr: '📐', labelAr: 'التوسع',                  labelEn: 'Scaling Up',            cat: 'الإدارة', adminOnly: true },
  { path: '/lifebook',      emojiAr: '📓', labelAr: 'كتاب حياتك',             labelEn: 'Lifebook',              cat: 'الإدارة', adminOnly: true },
]

export default function SearchModal({ onClose }) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const isAr = lang === 'ar'
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const isAdmin = currentUser?.role === 'admin'

  const results = query.trim()
    ? ALL_FEATURES.filter(f => {
        if (f.adminOnly && !isAdmin) return false
        const q = query.toLowerCase()
        return (
          f.labelAr.includes(query) ||
          f.labelEn.toLowerCase().includes(q) ||
          f.cat.includes(query)
        )
      })
    : ALL_FEATURES.filter(f => !f.adminOnly || isAdmin)

  const grouped = results.reduce((acc, f) => {
    if (!acc[f.cat]) acc[f.cat] = []
    acc[f.cat].push(f)
    return acc
  }, {})

  const handleSelect = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111',
          borderBottom: '1px solid #1e1e1e',
          padding: '52px 16px 12px',
          direction: isAr ? 'rtl' : 'ltr',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10,
          background: '#1a1a1a', borderRadius: 14, padding: '10px 14px',
          border: '1px solid #2a2a2a' }}>
          <Search size={16} style={{ color: '#666', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن ميزة...' : 'Search features...'}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: 15,
              textAlign: isAr ? 'right' : 'left',
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
            <X size={16} />
          </button>
        </div>
        {query && (
          <p style={{ fontSize: 11, color: '#555', marginTop: 8, textAlign: isAr ? 'right' : 'left' }}>
            {results.length} {isAr ? 'نتيجة' : 'results'}
          </p>
        )}
      </div>

      {/* Results */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px',
          direction: isAr ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
      >
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#555',
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              {cat}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(f => (
                <button
                  key={f.path}
                  onClick={() => handleSelect(f.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#141414', borderRadius: 12, padding: '11px 14px',
                    border: '1px solid #1e1e1e', cursor: 'pointer',
                    textAlign: isAr ? 'right' : 'left',
                    transition: 'all 0.15s',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emojiAr}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>
                    {isAr ? f.labelAr : f.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40, color: '#444' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p style={{ fontSize: 14 }}>{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
