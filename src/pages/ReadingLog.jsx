import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const CATEGORIES = [
  { id: 'selfdev',     ar: 'تطوير ذاتي', en: 'Self Dev',    emoji: '🧠' },
  { id: 'business',   ar: 'أعمال',       en: 'Business',    emoji: '💼' },
  { id: 'spiritual',  ar: 'روحانيات',    en: 'Spirituality',emoji: '✨' },
  { id: 'science',    ar: 'علم',          en: 'Science',     emoji: '🔬' },
  { id: 'history',    ar: 'تاريخ',        en: 'History',     emoji: '📜' },
  { id: 'novel',      ar: 'رواية',        en: 'Novel',       emoji: '📖' },
  { id: 'health',     ar: 'صحة',          en: 'Health',      emoji: '💪' },
  { id: 'other',      ar: 'أخرى',         en: 'Other',       emoji: '📚' },
]

const STATUS_LABELS = {
  reading:  { ar: 'يُقرأ الآن', en: 'Reading',  color: '#3498db', badge: '📖' },
  done:     { ar: 'مكتمل',      en: 'Done',      color: '#2ecc71', badge: '✅' },
  wishlist: { ar: 'قائمة أمنيات', en: 'Wishlist', color: '#9b59b6', badge: '🌟' },
}

const EMPTY_FORM = {
  titleAr: '', titleEn: '', author: '',
  category: 'selfdev', status: 'wishlist',
  pages: '', rating: 0, insight: '',
  startDate: '', endDate: '',
  takeaways: ['', '', ''],
  actionItem: '',
  actionApplied: false,
  actionAppliedNote: '',
}

const TABS = [
  { id: 'all',      ar: 'الكل',           en: 'All' },
  { id: 'reading',  ar: 'يُقرأ',          en: 'Reading' },
  { id: 'done',     ar: 'مكتمل',          en: 'Done' },
  { id: 'wishlist', ar: 'قائمة أمنيات',   en: 'Wishlist' },
]

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          className={readonly ? 'cursor-default' : 'transition-transform active:scale-90'}
          style={{ fontSize: readonly ? 14 : 22, lineHeight: 1 }}
        >
          <span style={{ color: star <= value ? '#c9a84c' : '#333' }}>★</span>
        </button>
      ))}
    </div>
  )
}

function getCatMeta(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

export default function ReadingLog() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const raw = state.readingLog || {}
  const books = raw.books || []
  const yearlyGoal = raw.yearlyGoal || 24

  const [activeTab, setActiveTab] = useState('all')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [settingGoal, setSettingGoal] = useState(false)
  const [goalInput, setGoalInput]   = useState(String(yearlyGoal))

  function saveBooks(newBooks, newGoal) {
    update('readingLog', { books: newBooks, yearlyGoal: newGoal !== undefined ? newGoal : yearlyGoal })
  }

  function saveGoal() {
    const g = parseInt(goalInput)
    if (!isNaN(g) && g > 0) {
      update('readingLog', { books, yearlyGoal: g })
    }
    setSettingGoal(false)
  }

  function openAddForm() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  function openEditForm(book) {
    setForm({
      titleAr:   book.titleAr   || '',
      titleEn:   book.titleEn   || '',
      author:    book.author    || '',
      category:  book.category  || 'selfdev',
      status:    book.status    || 'wishlist',
      pages:     String(book.pages || ''),
      rating:    book.rating    || 0,
      insight:   book.insight   || '',
      startDate: book.startDate || '',
      endDate:   book.endDate   || '',
      takeaways: book.takeaways || ['', '', ''],
      actionItem: book.actionItem || '',
      actionApplied: book.actionApplied || false,
      actionAppliedNote: book.actionAppliedNote || '',
    })
    setEditId(book.id)
    setShowForm(true)
  }

  function submitForm() {
    if (!form.titleAr.trim() && !form.titleEn.trim()) return
    const bookData = {
      id:        editId || `b_${Date.now()}`,
      titleAr:   form.titleAr.trim(),
      titleEn:   form.titleEn.trim(),
      author:    form.author.trim(),
      category:  form.category,
      status:    form.status,
      pages:     form.pages ? parseInt(form.pages) : null,
      rating:    form.rating,
      insight:   form.insight.trim(),
      startDate: form.startDate,
      endDate:   form.endDate,
      takeaways: form.takeaways,
      actionItem: form.actionItem.trim(),
      actionApplied: form.actionApplied,
      actionAppliedNote: form.actionAppliedNote.trim(),
    }
    if (editId) {
      saveBooks(books.map(b => b.id === editId ? bookData : b))
    } else {
      saveBooks([bookData, ...books])
    }
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
  }

  function deleteBook(id) {
    saveBooks(books.filter(b => b.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function toggleActionApplied(id) {
    saveBooks(books.map(b => b.id === id ? { ...b, actionApplied: !b.actionApplied } : b))
  }

  const currentYear = new Date().getFullYear()
  const doneThisYear = useMemo(() =>
    books.filter(b => b.status === 'done' && b.endDate?.startsWith(String(currentYear))).length,
    [books, currentYear]
  )
  const totalDone    = books.filter(b => b.status === 'done').length
  const readingNow   = books.filter(b => b.status === 'reading').length
  const wishlistCnt  = books.filter(b => b.status === 'wishlist').length
  const avgRating    = useMemo(() => {
    const rated = books.filter(b => b.status === 'done' && b.rating > 0)
    if (!rated.length) return 0
    return (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
  }, [books])

  const filteredBooks = useMemo(() =>
    activeTab === 'all' ? books : books.filter(b => b.status === activeTab),
    [books, activeTab]
  )

  const goalPct = Math.min((doneThisYear / yearlyGoal) * 100, 100)

  return (
    <Layout
      title={isAr ? 'سجل القراءة' : 'Reading Log'}
      subtitle={isAr ? 'رحلتك مع الكتب تصنع عقلك' : 'Your reading journey shapes your mind'}
      helpKey="reading"
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: isAr ? 'الكل' : 'Total', value: books.length, color: '#c9a84c' },
            { label: isAr ? 'يُقرأ' : 'Reading', value: readingNow, color: '#3498db' },
            { label: isAr ? 'أمنيات' : 'Wishlist', value: wishlistCnt, color: '#9b59b6' },
            { label: isAr ? 'تقييم' : 'Avg ★', value: avgRating || '—', color: '#f5d98b' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Yearly Reading Challenge */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, #1a1200, #1a1a1a)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                📚 {isAr ? `تحدي ${currentYear}` : `${currentYear} Challenge`}
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {doneThisYear}
                <span className="text-base font-normal" style={{ color: '#888' }}>/{yearlyGoal}</span>
                <span className="text-sm font-normal ms-1" style={{ color: '#888' }}>
                  {isAr ? 'كتاب' : 'books'}
                </span>
              </p>
            </div>
            <button
              onClick={() => { setGoalInput(String(yearlyGoal)); setSettingGoal(v => !v) }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              {isAr ? 'تعديل الهدف' : 'Edit Goal'}
            </button>
          </div>

          {settingGoal && (
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: '#111', border: '1px solid #444', outline: 'none' }}
                min={1} max={365}
              />
              <button onClick={saveGoal} className="btn-gold px-4 text-sm py-2">
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          )}

          <div style={{ background: '#2a2a2a', borderRadius: 99, height: 8 }}>
            <div
              style={{
                width: `${goalPct}%`,
                height: '100%',
                borderRadius: 99,
                background: goalPct >= 100
                  ? 'linear-gradient(90deg, #c9a84c, #f5d98b)'
                  : 'linear-gradient(90deg, #c9a84c88, #c9a84c)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: '#888' }}>
            {goalPct >= 100
              ? (isAr ? '🏆 حققت هدفك!' : '🏆 Goal achieved!')
              : isAr
                ? `${yearlyGoal - doneThisYear} كتاب متبقٍ`
                : `${yearlyGoal - doneThisYear} books remaining`
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.id ? '#c9a84c' : '#1a1a1a',
                color: activeTab === tab.id ? '#000' : '#888',
                border: `1px solid ${activeTab === tab.id ? '#c9a84c' : '#2a2a2a'}`,
              }}
            >
              {isAr ? tab.ar : tab.en}
              {tab.id !== 'all' && (
                <span className="ms-1 opacity-70">
                  ({tab.id === 'reading' ? readingNow : tab.id === 'done' ? totalDone : wishlistCnt})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Add Book Button */}
        <button
          onClick={openAddForm}
          className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
          style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px dashed rgba(201,168,76,0.4)',
            color: '#c9a84c',
          }}
        >
          + {isAr ? 'أضف كتاباً' : 'Add a Book'}
        </button>

        {/* Add/Edit Form */}
        {showForm && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {editId ? (isAr ? 'تعديل الكتاب' : 'Edit Book') : (isAr ? 'كتاب جديد' : 'New Book')}
            </p>

            <input
              type="text"
              placeholder={isAr ? 'عنوان الكتاب بالعربية' : 'Arabic title'}
              value={form.titleAr}
              onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
            />
            <input
              type="text"
              placeholder={isAr ? 'عنوان الكتاب بالإنجليزية' : 'English title'}
              value={form.titleEn}
              onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
            />
            <input
              type="text"
              placeholder={isAr ? 'المؤلف' : 'Author'}
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
            />
            <input
              type="number"
              placeholder={isAr ? 'عدد الصفحات' : 'Pages'}
              value={form.pages}
              onChange={e => setForm(f => ({ ...f, pages: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
              style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
            />

            {/* Category */}
            <div>
              <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'التصنيف' : 'Category'}</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className="rounded-lg px-2 py-1 text-xs font-medium transition-all"
                    style={{
                      background: form.category === cat.id ? 'rgba(201,168,76,0.2)' : '#111',
                      border: `1px solid ${form.category === cat.id ? '#c9a84c' : '#333'}`,
                      color: form.category === cat.id ? '#c9a84c' : '#666',
                    }}
                  >
                    {cat.emoji} {isAr ? cat.ar : cat.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'الحالة' : 'Status'}</p>
              <div className="flex gap-2">
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: key }))}
                    className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
                    style={{
                      background: form.status === key ? `${val.color}22` : '#111',
                      border: `1px solid ${form.status === key ? val.color : '#333'}`,
                      color: form.status === key ? val.color : '#666',
                    }}
                  >
                    {val.badge} {isAr ? val.ar : val.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            {(form.status === 'reading' || form.status === 'done') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'تاريخ البدء' : 'Start Date'}</p>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2 text-sm text-white"
                    style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                  />
                </div>
                {form.status === 'done' && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'تاريخ الإنهاء' : 'End Date'}</p>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2 text-sm text-white"
                      style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rating + Insight for done books */}
            {form.status === 'done' && (
              <>
                <div>
                  <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'التقييم' : 'Rating'}</p>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <textarea
                  placeholder={isAr ? 'أهم فكرة أو درس تعلمته من الكتاب...' : 'Key insight or lesson from the book...'}
                  value={form.insight}
                  onChange={e => setForm(f => ({ ...f, insight: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
                  style={{ background: '#111', border: '1px solid #333', outline: 'none', minHeight: 80 }}
                  rows={3}
                />

                {/* Learning → Doing: Top 3 Takeaways */}
                <div>
                  <p className="text-xs mb-2 font-bold" style={{ color: '#c9a84c' }}>
                    📝 {isAr ? 'أهم ٣ دروس مستفادة' : 'Top 3 Takeaways'}
                  </p>
                  <div className="space-y-1.5">
                    {form.takeaways.map((tk, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: tk ? '#c9a84c' : '#2a2a2a', color: tk ? '#000' : '#555' }}>{i + 1}</span>
                        <input type="text" value={tk}
                          onChange={e => {
                            const arr = [...form.takeaways]; arr[i] = e.target.value
                            setForm(f => ({ ...f, takeaways: arr }))
                          }}
                          placeholder={isAr ? `الدرس ${i + 1}...` : `Takeaway ${i + 1}...`}
                          className="flex-1 rounded-xl px-3 py-2 text-sm text-white"
                          style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning → Doing: 1 Action to Apply */}
                <div>
                  <p className="text-xs mb-2 font-bold" style={{ color: '#2ecc71' }}>
                    🎯 {isAr ? 'إجراء واحد للتطبيق هذا الأسبوع' : '1 Action to Apply This Week'}
                  </p>
                  <input type="text" value={form.actionItem}
                    onChange={e => setForm(f => ({ ...f, actionItem: e.target.value }))}
                    placeholder={isAr ? 'ما الشيء الوحيد الذي ستطبقه من هذا الكتاب؟' : 'What one thing will you apply from this book?'}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white"
                    style={{ background: '#111', border: '1px solid #2ecc7140', outline: 'none' }} />
                </div>

                {/* Did You Apply? Tracking */}
                {form.actionItem && (
                  <div className="rounded-xl p-3" style={{
                    background: form.actionApplied ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.05)',
                    border: `1px solid ${form.actionApplied ? '#2ecc7130' : '#e6394620'}`
                  }}>
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => setForm(f => ({ ...f, actionApplied: !f.actionApplied }))}
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: form.actionApplied ? '#2ecc71' : '#2a2a2a', border: `2px solid ${form.actionApplied ? '#2ecc71' : '#444'}` }}>
                        {form.actionApplied && <span className="text-white text-xs">✓</span>}
                      </button>
                      <p className="text-xs font-bold" style={{ color: form.actionApplied ? '#2ecc71' : '#e63946' }}>
                        {form.actionApplied
                          ? (isAr ? '✅ تم التطبيق!' : '✅ Applied!')
                          : (isAr ? '⏳ لم يُطبق بعد' : '⏳ Not yet applied')}
                      </p>
                    </div>
                    {form.actionApplied && (
                      <input type="text" value={form.actionAppliedNote}
                        onChange={e => setForm(f => ({ ...f, actionAppliedNote: e.target.value }))}
                        placeholder={isAr ? 'كيف طبقت هذا الدرس؟' : 'How did you apply it?'}
                        className="w-full rounded-lg px-3 py-2 text-xs text-white"
                        style={{ background: '#111', border: '1px solid #333', outline: 'none' }} />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={submitForm} className="btn-gold flex-1 text-sm py-2">
                {editId ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'أضف الكتاب' : 'Add Book')}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
                className="px-4 text-sm py-2 rounded-xl"
                style={{ background: '#2a2a2a', color: '#888' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Book List */}
        {filteredBooks.length === 0 ? (
          books.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px dashed #2a2a2a' }}>
              <p className="text-5xl mb-4">📚</p>
              <p className="text-base font-bold text-white mb-2">
                {isAr ? 'مكتبتك فارغة بعد' : 'Your library is empty'}
              </p>
              <p className="text-xs mb-5" style={{ color: '#666', lineHeight: 1.7 }}>
                {isAr
                  ? 'القراء يعيشون ألف حياة قبل أن يموتوا\nأضف أول كتاب وابدأ رحلة التعلم'
                  : 'Readers live a thousand lives before they die.\nAdd your first book and start your learning journey.'}
              </p>
              <button onClick={openAddForm}
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#0a0a0a',
                  border: 'none', cursor: 'pointer', padding: '12px 24px',
                  borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                📖 {isAr ? 'أضف أول كتاب' : 'Add Your First Book'}
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm" style={{ color: '#444' }}>
                {isAr ? 'لا توجد كتب في هذه الفئة' : 'No books in this category'}
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredBooks.map(book => {
              const cat = getCatMeta(book.category)
              const status = STATUS_LABELS[book.status] || STATUS_LABELS.wishlist
              const isExpanded = expandedId === book.id
              const title = isAr
                ? (book.titleAr || book.titleEn)
                : (book.titleEn || book.titleAr)

              return (
                <div
                  key={book.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${status.color}30`, background: '#0e0e0e' }}
                >
                  {/* Book Header */}
                  <button
                    className="w-full flex items-start gap-3 p-4 text-start"
                    onClick={() => setExpandedId(isExpanded ? null : book.id)}
                  >
                    {/* Category Emoji */}
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${status.color}15`, border: `1px solid ${status.color}30` }}
                    >
                      {cat.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-white leading-tight">{title || '—'}</p>
                        <span
                          className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${status.color}22`, color: status.color }}
                        >
                          {status.badge}
                        </span>
                      </div>
                      {book.author && (
                        <p className="text-xs mt-0.5" style={{ color: '#888' }}>{book.author}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}
                        >
                          {cat.emoji} {isAr ? cat.ar : cat.en}
                        </span>
                        {book.pages && (
                          <span className="text-xs" style={{ color: '#555' }}>
                            {book.pages} {isAr ? 'ص' : 'pp'}
                          </span>
                        )}
                        {book.status === 'done' && book.rating > 0 && (
                          <StarRating value={book.rating} readonly />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 space-y-3"
                      style={{ borderTop: '1px solid #1e1e1e' }}
                    >
                      {/* Dates */}
                      {(book.startDate || book.endDate) && (
                        <div className="flex gap-4 pt-3">
                          {book.startDate && (
                            <div>
                              <p className="text-xs" style={{ color: '#555' }}>{isAr ? 'بدأ في' : 'Started'}</p>
                              <p className="text-xs font-medium text-white mt-0.5">{book.startDate}</p>
                            </div>
                          )}
                          {book.endDate && (
                            <div>
                              <p className="text-xs" style={{ color: '#555' }}>{isAr ? 'انتهى في' : 'Finished'}</p>
                              <p className="text-xs font-medium text-white mt-0.5">{book.endDate}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Insight */}
                      {book.insight && (
                        <div
                          className="rounded-xl p-3"
                          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
                        >
                          <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                            💡 {isAr ? 'أهم فكرة' : 'Key Insight'}
                          </p>
                          <p className="text-xs text-white leading-relaxed">{book.insight}</p>
                        </div>
                      )}

                      {/* Takeaways */}
                      {(book.takeaways || []).filter(Boolean).length > 0 && (
                        <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>
                            📝 {isAr ? 'دروس مستفادة' : 'Takeaways'}
                          </p>
                          {book.takeaways.filter(Boolean).map((tk, i) => (
                            <p key={i} className="text-xs leading-relaxed mb-1" style={{ color: '#aaa' }}>
                              <span style={{ color: '#c9a84c' }}>{i + 1}.</span> {tk}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Action Item */}
                      {book.actionItem && (
                        <div className="rounded-xl p-3" style={{
                          background: book.actionApplied ? 'rgba(46,204,113,0.08)' : 'rgba(52,152,219,0.08)',
                          border: `1px solid ${book.actionApplied ? '#2ecc7130' : '#3498db30'}`
                        }}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold" style={{ color: book.actionApplied ? '#2ecc71' : '#3498db' }}>
                              🎯 {isAr ? 'إجراء للتطبيق' : 'Action to Apply'}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                              background: book.actionApplied ? '#2ecc7122' : '#e6394622',
                              color: book.actionApplied ? '#2ecc71' : '#e63946'
                            }}>
                              {book.actionApplied ? (isAr ? 'تم ✓' : 'Done ✓') : (isAr ? 'قيد التطبيق' : 'Pending')}
                            </span>
                          </div>
                          <p className="text-xs text-white">{book.actionItem}</p>
                          {book.actionAppliedNote && (
                            <p className="text-xs mt-1" style={{ color: '#2ecc71' }}>→ {book.actionAppliedNote}</p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => openEditForm(book)}
                          className="flex-1 rounded-xl py-2 text-xs font-bold"
                          style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                        >
                          ✏️ {isAr ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="flex-1 rounded-xl py-2 text-xs font-bold"
                          style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)' }}
                        >
                          🗑 {isAr ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
