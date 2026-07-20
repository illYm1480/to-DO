import { useEffect, useMemo, useState } from 'react';
import { Apple, CalendarDays, Check, ChevronRight, Compass, Download, LayoutDashboard, ListTodo, LogOut, Monitor, NotebookPen, Plus, Search, Share, Sparkles, Target, Trash2, X } from 'lucide-react';
import { addItem, authenticate, getItems, logout, removeItem, toggleItem } from './api';
import type { ItemKind, WorkspaceItem } from './types';

const meta = {
  goal: { one: 'Цель', many: 'Цели', icon: Target, color: '#7257d5' },
  task: { one: 'Задача', many: 'Задачи', icon: ListTodo, color: '#e26b4e' },
  plan: { one: 'План', many: 'Планы', icon: CalendarDays, color: '#288b79' },
  note: { one: 'Заметка', many: 'Заметки', icon: NotebookPen, color: '#b97b2c' },
} satisfies Record<ItemKind, { one: string; many: string; icon: typeof Target; color: string }>;
type View = 'dashboard' | ItemKind;

export default function App() {
  if (window.location.pathname === '/download') return <DownloadPage/>;
  const [user, setUser] = useState<{ id:number; nickname:string } | null>(null);
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ItemKind>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user) getItems().then(setItems).finally(() => setLoading(false)) }, [user]);
  const shown = useMemo(() => items.filter(i => (view === 'dashboard' || i.kind === view) && `${i.title} ${i.description}`.toLowerCase().includes(query.toLowerCase())), [items, view, query]);
  const tasks = items.filter(i => i.kind === 'task');
  const done = tasks.filter(i => i.status === 'done').length;
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const keys = Object.keys(meta) as ItemKind[];
  function compose(value: ItemKind = view === 'dashboard' ? 'task' : view) { setKind(value); setOpen(true) }
  async function submit(e: React.FormEvent) { e.preventDefault(); if (!title.trim()) return; const item = await addItem({ kind, title, description, dueDate: dueDate || null }); setItems(x => [item, ...x]); setTitle(''); setDescription(''); setDueDate(''); setOpen(false) }
  async function toggle(item: WorkspaceItem) { const updated = await toggleItem(item); setItems(x => x.map(i => i.id === item.id ? updated : i)) }
  async function remove(id: number) { await removeItem(id); setItems(x => x.filter(i => i.id !== id)) }

  if (!user) return <AuthScreen onAuthenticated={setUser}/>;
  return <div className="shell">
    <aside>
      <div className="brand"><i><Compass size={20}/></i>to-DO</div>
      <button className="quick" onClick={() => compose()}><Plus size={18}/>Новая запись</button>
      <nav><button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}><LayoutDashboard/>Обзор</button><small>МОЁ ПРОСТРАНСТВО</small>
        {keys.map(k => { const Icon = meta[k].icon; return <button key={k} className={view === k ? 'active' : ''} onClick={() => setView(k)}><Icon/>{meta[k].many}<em>{items.filter(i => i.kind === k).length}</em></button> })}
      </nav>
      <div className="quote"><Sparkles size={17}/><p>Маленький шаг сегодня — ясное направление завтра.</p></div>
      <div className="profile"><b>{user.nickname.slice(0,1).toUpperCase()}</b><span><strong>{user.nickname}</strong><small>Локально и приватно</small></span><button title="Выйти" onClick={() => { logout(); setItems([]); setUser(null) }}><LogOut/></button></div>
    </aside>
    <main>
      <header><label><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти в своём пространстве..."/></label><span>Сегодня, {new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long' }).format(new Date())}</span></header>
      <div className="content">
        <section className="hero"><div><small>ЛИЧНЫЙ ЦЕНТР УПРАВЛЕНИЯ</small><h1>{view === 'dashboard' ? 'Добрый день 👋' : meta[view].many}</h1><p>{view === 'dashboard' ? 'Соберите мысли, определите главное и двигайтесь вперёд.' : `Всё важное в разделе «${meta[view].many}».`}</p></div><button className="primary" onClick={() => compose()}><Plus size={18}/>Добавить</button></section>
        {view === 'dashboard' && <><section className="stats"><article><i className="purple"><Target/></i><span><small>Активные цели</small><strong>{items.filter(i => i.kind === 'goal' && i.status !== 'done').length}</strong></span></article><article><i className="coral"><ListTodo/></i><span><small>Задачи в работе</small><strong>{tasks.length - done}</strong></span></article><article className="dark"><div className="ring" style={{'--p': `${progress * 3.6}deg`} as React.CSSProperties}><b>{progress}%</b></div><span><small>Прогресс задач</small><strong>{done} выполнено</strong></span></article></section>
          <div className="heading"><div><small>БЫСТРЫЙ СТАРТ</small><h2>Что хотите записать?</h2></div></div><section className="creators">{keys.map(k => { const Icon = meta[k].icon; return <button key={k} onClick={() => compose(k)} style={{'--accent': meta[k].color} as React.CSSProperties}><i><Icon/></i><span><strong>{meta[k].one}</strong><small>{k === 'goal' ? 'Определить направление' : k === 'task' ? 'Не забыть важное' : k === 'plan' ? 'Разложить по шагам' : 'Сохранить мысль'}</small></span><Plus/></button> })}</section></>}
        <section><div className="heading"><div><small>{view === 'dashboard' ? 'ПОСЛЕДНИЕ ЗАПИСИ' : 'ВАШИ ЗАПИСИ'}</small><h2>{view === 'dashboard' ? 'В центре внимания' : meta[view].many}</h2></div><span>{shown.length} записей</span></div>
          {loading ? <div className="empty">Загружаем пространство…</div> : !shown.length ? <div className="empty"><Target/><h3>Здесь пока спокойно</h3><p>Добавьте первую запись — так начинается любое движение.</p><button onClick={() => compose()}>Создать запись</button></div> : <div className="list">{shown.slice(0, view === 'dashboard' ? 6 : undefined).map(item => { const Icon = meta[item.kind].icon; return <article key={item.id} className={item.status === 'done' ? 'done' : ''}><button className="check" onClick={() => toggle(item)}>{item.status === 'done' && <Check/>}</button><i style={{background:`${meta[item.kind].color}18`,color:meta[item.kind].color}}><Icon/></i><div><strong>{item.title}</strong><p>{item.description || `${meta[item.kind].one} без описания`}</p></div>{item.dueDate && <time><CalendarDays/> {new Intl.DateTimeFormat('ru-RU').format(new Date(item.dueDate))}</time>}<button className="trash" onClick={() => remove(item.id)}><Trash2/></button></article> })}</div>}
        </section>
      </div>
    </main>
    {open && <div className="backdrop" onMouseDown={() => setOpen(false)}><form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><small>НОВАЯ ЗАПИСЬ</small><h2>Добавьте что-то важное</h2></div><button type="button" onClick={() => setOpen(false)}><X/></button></div><label>Тип<div className="kinds">{keys.map(k => { const Icon = meta[k].icon; return <button type="button" key={k} className={kind === k ? 'selected' : ''} onClick={() => setKind(k)}><Icon/>{meta[k].one}</button> })}</div></label><label>Название<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Выучить английский до B2"/></label><label>Описание<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Почему это важно? Что нужно сделать?"/></label><label>Дата<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/></label><div className="actions"><button type="button" onClick={() => setOpen(false)}>Отмена</button><button className="primary">Сохранить запись</button></div></form></div>}
  </div>
}

function DownloadPage(){const windowsUrl='https://github.com/illYm1480/to-DO/releases/download/v0.3.0/to-DO-Setup-0.3.0.exe';return <div className="download-page"><div className="download-glow"/><header><div className="download-brand"><i><Compass/></i>to-DO</div><a href="/">Открыть веб-версию <ChevronRight/></a></header><main><div className="download-hero"><span>ДЛЯ ВСЕХ ВАШИХ УСТРОЙСТВ</span><h1>Ваши планы всегда рядом.</h1><p>Выберите устройство и начните пользоваться to-DO. Один аккаунт — единое пространство на компьютере и телефоне.</p></div><section className="platform-grid"><article className="platform"><div className="platform-icon"><Monitor/></div><div><small>WINDOWS 10 И НОВЕЕ</small><h2>Приложение для Windows</h2><p>Полноценное отдельное приложение с ярлыком на рабочем столе.</p></div><a className="download-button" href={windowsUrl}><Download/> Скачать для Windows</a><footer>Версия 0.3.0 · 64-bit · около 102 МБ</footer></article><article className="platform ios"><div className="platform-icon"><Apple/></div><div><small>IPHONE И IPAD</small><h2>Установить на iOS</h2><p>Откройте to-DO в Safari, нажмите «Поделиться», затем «На экран Домой».</p></div><a className="download-button secondary" href="/"><Share/> Открыть в Safari</a><footer>Не требует App Store · облачная синхронизация</footer></article></section><div className="download-note"><Sparkles/><span><strong>Можно ничего не устанавливать.</strong> to-DO работает прямо в браузере на Windows, macOS, iOS и Android.</span><a href="/">Открыть сейчас</a></div></main></div>}

function AuthScreen({ onAuthenticated }: { onAuthenticated:(user:{id:number;nickname:string}) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login'); const [nickname,setNickname] = useState(''); const [password,setPassword] = useState(''); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e:React.FormEvent) { e.preventDefault(); setError(''); setBusy(true); try { onAuthenticated(await authenticate(mode,nickname,password)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось войти') } finally { setBusy(false) } }
  return <div className="auth-screen"><div className="auth-glow"/><section className="auth-card"><div className="auth-logo"><i><Compass/></i><span>to-DO</span></div><div className="auth-copy"><small>ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</small><h1>{mode === 'login' ? 'С возвращением' : 'Создайте свой профиль'}</h1><p>{mode === 'login' ? 'Продолжите с того места, где остановились.' : 'Никакой почты — только никнейм и пароль.'}</p></div><form onSubmit={submit}><label>Никнейм<input autoFocus value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Например, alex" minLength={3}/></label><label>Пароль<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Минимум 4 символа" minLength={4}/></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Подождите…' : mode === 'login' ? 'Войти в пространство' : 'Создать профиль'}</button></form><div className="auth-switch">{mode === 'login' ? 'Впервые здесь?' : 'Уже есть профиль?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Создать профиль' : 'Войти'}</button></div><footer>{window.location.protocol === 'file:' ? 'Данные хранятся только на этом компьютере' : 'Данные защищены и синхронизируются через облако'}</footer></section></div>
}
