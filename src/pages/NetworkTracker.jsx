import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const EMPTY_CONTACT = {
  name: '',
  role: '',
  company: '',
  value: '',
  lastContact: '',
  nextFollowUp: '',
  given: '',
  notes: '',
}

export default function NetworkTracker() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const contacts = state.networkTracker || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_CONTACT)
  const [editId, setEditId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all') // all, overdue, recent

  const today = new Date().toISOString().split('T')[0]

  function saveContacts(newContacts) {
    update('networkTracker', newContacts)
  }

  function openAddForm() {
    setForm(EMPTY_CONTACT)
    setEditId(null)
    setShowForm(true)
  }

  function openEditForm(contact) {
    setForm({
      name: contact.name || '',
      role: contact.role || '',
      company: contact.company || '',
      value: contact.value || '',
      lastContact: contact.lastContact || '',
      nextFollowUp: contact.nextFollowUp || '',
      given: contact.given || '',
      notes: contact.notes || '',
    })
    setEditId(contact.id)
    setShowForm(true)
  }

  function submitForm() {
    if (!form.name.trim()) return
    const contactData = {
      id: editId || `n_${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      company: form.company.trim(),
      value: form.value.trim(),
      lastContact: form.lastContact,
      nextFollowUp: form.nextFollowUp,
      given: form.given.trim(),
      notes: form.notes.trim(),
      createdAt: editId ? (contacts.find(c => c.id === editId)?.createdAt || today) : today,
    }
    if (editId) {
      saveContacts(contacts.map(c => c.id === editId ? contactData : c))
    } else {
      saveContacts([contactData, ...contacts])
    }
    setForm(EMPTY_CONTACT)
    setEditId(null)
    setShowForm(false)
  }

  function deleteContact(id) {
    saveContacts(contacts.filter(c => c.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function markContacted(id) {
    saveContacts(contacts.map(c => c.id === id ? { ...c, lastContact: today } : c))
  }

  // Stats
  const totalContacts = contacts.length
  const overdueContacts = useMemo(() =>
    contacts.filter(c => c.nextFollowUp && c.nextFollowUp <= today),
    [contacts, today]
  )
  const recentContacts = useMemo(() =>
    contacts.filter(c => {
      if (!c.lastContact) return false
      const diff = (new Date(today) - new Date(c.lastContact)) / (1000 * 60 * 60 * 24)
      return diff <= 7
    }),
    [contacts, today]
  )

  // Filter logic
  const filteredContacts = useMemo(() => {
    if (filter === 'overdue') return overdueContacts
    if (filter === 'recent') return recentContacts
    return [...contacts].sort((a, b) => {
      // Overdue first, then by next follow-up
      const aOverdue = a.nextFollowUp && a.nextFollowUp <= today
      const bOverdue = b.nextFollowUp && b.nextFollowUp <= today
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      return (a.nextFollowUp || 'z').localeCompare(b.nextFollowUp || 'z')
    })
  }, [contacts, filter, today])

  const getDaysSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Math.floor((new Date(today) - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    return diff
  }

  const inputStyle = { background: '#111', border: '1px solid #333', color: 'white', borderRadius: 12, padding: '10px 14px', width: '100%', fontSize: 13, outline: 'none' }

  return (
    <Layout
      title={isAr ? 'شبكة العلاقات المهنية' : 'Network Tracker'}
      subtitle={isAr ? 'علاقاتك هي ثروتك الحقيقية' : 'Your network is your real wealth'}
      helpKey="network"
    >
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isAr ? 'جهات الاتصال' : 'Contacts', value: totalContacts, color: '#c9a84c', emoji: '👥' },
            { label: isAr ? 'بحاجة متابعة' : 'Overdue', value: overdueContacts.length, color: '#e63946', emoji: '⚠️' },
            { label: isAr ? 'تواصل حديث' : 'Recent', value: recentContacts.length, color: '#2ecc71', emoji: '✅' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <span className="text-lg">{s.emoji}</span>
              <div className="text-xl font-black mt-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Overdue Alert */}
        {overdueContacts.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: '#e6394610', border: '1px solid #e6394630' }}>
            <p className="text-xs font-bold" style={{ color: '#e63946' }}>
              ⚠️ {isAr
                ? `${overdueContacts.length} شخص يحتاج متابعة — لا تفقد علاقاتك!`
                : `${overdueContacts.length} contact${overdueContacts.length > 1 ? 's' : ''} overdue — don't lose your connections!`}
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', ar: 'الكل', en: 'All' },
            { id: 'overdue', ar: 'بحاجة متابعة', en: 'Overdue' },
            { id: 'recent', ar: 'حديث', en: 'Recent' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className="flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                background: filter === tab.id ? '#c9a84c' : '#1a1a1a',
                color: filter === tab.id ? '#000' : '#888',
                border: `1px solid ${filter === tab.id ? '#c9a84c' : '#2a2a2a'}`,
              }}>
              {isAr ? tab.ar : tab.en}
              {tab.id === 'overdue' && overdueContacts.length > 0 && (
                <span className="ms-1 px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: '#e63946', color: '#fff', fontSize: 9 }}>{overdueContacts.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Add Contact Button */}
        <button onClick={openAddForm}
          className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}>
          + {isAr ? 'أضف جهة اتصال' : 'Add Contact'}
        </button>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {editId ? (isAr ? 'تعديل جهة الاتصال' : 'Edit Contact') : (isAr ? 'جهة اتصال جديدة' : 'New Contact')}
            </p>

            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={isAr ? 'الاسم *' : 'Name *'} style={inputStyle} />

            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder={isAr ? 'المنصب / الدور' : 'Role / Title'} style={inputStyle} />
              <input type="text" value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder={isAr ? 'الشركة' : 'Company'} style={inputStyle} />
            </div>

            <input type="text" value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={isAr ? 'ما القيمة المتبادلة؟ (كيف يمكنكم مساعدة بعض؟)' : 'Mutual value? (how can you help each other?)'}
              style={inputStyle} />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'آخر تواصل' : 'Last Contact'}</p>
                <input type="date" value={form.lastContact}
                  onChange={e => setForm(f => ({ ...f, lastContact: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'المتابعة القادمة' : 'Next Follow-up'}</p>
                <input type="date" value={form.nextFollowUp}
                  onChange={e => setForm(f => ({ ...f, nextFollowUp: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <input type="text" value={form.given}
              onChange={e => setForm(f => ({ ...f, given: e.target.value }))}
              placeholder={isAr ? 'ماذا أعطيت لهذا الشخص؟ (قيمة، نصيحة، تعريف...)' : 'What value have you given them? (advice, intro, resource...)'}
              style={inputStyle} />

            <textarea value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={isAr ? 'ملاحظات...' : 'Notes...'}
              className="resize-none" rows={2}
              style={{ ...inputStyle, minHeight: 50 }} />

            <div className="flex gap-2 pt-1">
              <button onClick={submitForm} className="btn-gold flex-1 text-sm py-2">
                {editId ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'أضف جهة الاتصال' : 'Add Contact')}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_CONTACT) }}
                className="px-4 text-sm py-2 rounded-xl" style={{ background: '#2a2a2a', color: '#888' }}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          contacts.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px dashed #2a2a2a' }}>
              <p className="text-5xl mb-4">🤝</p>
              <p className="text-base font-bold text-white mb-2">
                {isAr ? 'شبكتك فارغة' : 'Your network is empty'}
              </p>
              <p className="text-xs mb-5" style={{ color: '#666', lineHeight: 1.7 }}>
                {isAr
                  ? '"سر الحياة هو العطاء" — توني روبنز\nأضف أهم ٢٠ شخصاً في حياتك المهنية'
                  : '"The secret to living is giving" — Tony Robbins\nAdd your top 20 professional contacts'}
              </p>
              <button onClick={openAddForm}
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#0a0a0a',
                  border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                👥 {isAr ? 'أضف أول جهة اتصال' : 'Add Your First Contact'}
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm" style={{ color: '#444' }}>
                {isAr ? 'لا توجد نتائج في هذا الفلتر' : 'No contacts match this filter'}
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredContacts.map(contact => {
              const isExpanded = expandedId === contact.id
              const isOverdue = contact.nextFollowUp && contact.nextFollowUp <= today
              const daysSinceLast = getDaysSince(contact.lastContact)
              const daysToNext = contact.nextFollowUp ? Math.floor((new Date(contact.nextFollowUp) - new Date(today)) / (1000 * 60 * 60 * 24)) : null

              return (
                <div key={contact.id} className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${isOverdue ? '#e6394640' : '#1e1e1e'}`, background: '#0e0e0e' }}>

                  {/* Contact Header */}
                  <button className="w-full flex items-start gap-3 p-4 text-start"
                    onClick={() => setExpandedId(isExpanded ? null : contact.id)}>

                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg font-black"
                      style={{
                        background: isOverdue ? '#e6394618' : '#c9a84c15',
                        border: `2px solid ${isOverdue ? '#e63946' : '#c9a84c40'}`,
                        color: isOverdue ? '#e63946' : '#c9a84c',
                      }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{contact.name}</p>
                          {(contact.role || contact.company) && (
                            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
                              {contact.role}{contact.role && contact.company ? ' · ' : ''}{contact.company}
                            </p>
                          )}
                        </div>
                        {isOverdue && (
                          <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#e6394622', color: '#e63946' }}>
                            {isAr ? 'متأخر' : 'Overdue'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {daysSinceLast !== null && (
                          <span className="text-xs" style={{ color: daysSinceLast > 30 ? '#e63946' : daysSinceLast > 14 ? '#e67e22' : '#2ecc71' }}>
                            {isAr ? `آخر تواصل: ${daysSinceLast} يوم` : `Last: ${daysSinceLast}d ago`}
                          </span>
                        )}
                        {daysToNext !== null && (
                          <span className="text-xs" style={{ color: daysToNext < 0 ? '#e63946' : daysToNext <= 3 ? '#e67e22' : '#555' }}>
                            {daysToNext < 0
                              ? (isAr ? `متأخر ${Math.abs(daysToNext)} يوم` : `${Math.abs(daysToNext)}d overdue`)
                              : daysToNext === 0
                                ? (isAr ? 'اليوم!' : 'Today!')
                                : (isAr ? `متابعة بعد ${daysToNext} يوم` : `Follow-up in ${daysToNext}d`)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #1e1e1e' }}>

                      {/* Value Exchange */}
                      {contact.value && (
                        <div className="rounded-xl p-3 mt-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                          <p className="text-xs font-bold mb-1" style={{ color: '#3498db' }}>
                            🤝 {isAr ? 'القيمة المتبادلة' : 'Mutual Value'}
                          </p>
                          <p className="text-xs text-white leading-relaxed">{contact.value}</p>
                        </div>
                      )}

                      {/* What Value Given */}
                      {contact.given && (
                        <div className="rounded-xl p-3" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid #2ecc7125' }}>
                          <p className="text-xs font-bold mb-1" style={{ color: '#2ecc71' }}>
                            🎁 {isAr ? 'ما أعطيت' : 'Value Given'}
                          </p>
                          <p className="text-xs text-white leading-relaxed">{contact.given}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {contact.notes && (
                        <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                          <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>
                            📝 {isAr ? 'ملاحظات' : 'Notes'}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>{contact.notes}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => markContacted(contact.id)}
                          className="flex-1 rounded-xl py-2 text-xs font-bold"
                          style={{ background: '#2ecc7115', color: '#2ecc71', border: '1px solid #2ecc7130' }}>
                          ✅ {isAr ? 'تواصلت اليوم' : 'Contacted Today'}
                        </button>
                        <button onClick={() => openEditForm(contact)}
                          className="flex-1 rounded-xl py-2 text-xs font-bold"
                          style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}>
                          ✏️ {isAr ? 'تعديل' : 'Edit'}
                        </button>
                        <button onClick={() => deleteContact(contact.id)}
                          className="rounded-xl px-3 py-2 text-xs font-bold"
                          style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)' }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Tony Quote */}
        {contacts.length >= 3 && (
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs italic leading-relaxed" style={{ color: '#888' }}>
              {isAr
                ? '"جودة حياتك تتحدد بجودة علاقاتك" — توني روبنز'
                : '"The quality of your life is the quality of your relationships" — Tony Robbins'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
