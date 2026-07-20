import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type ItemKind = 'goal' | 'task' | 'plan' | 'note';
export interface WorkspaceItem { id: number; ownerId: number; kind: ItemKind; title: string; description: string; status: string; dueDate: string | null; createdAt: string }
interface User { id: number; nickname: string; nicknameKey: string; passwordHash: string; salt: string; createdAt: string }
interface Store { users: User[]; items: WorkspaceItem[] }

let filePath = '';
let store: Store = { users: [], items: [] };
function save() { const temporary = `${filePath}.tmp`; fs.writeFileSync(temporary, JSON.stringify(store, null, 2), 'utf8'); fs.renameSync(temporary, filePath) }
function hash(password: string, salt: string) { return crypto.scryptSync(password, salt, 64).toString('hex') }

export function initDatabase(dataDirectory: string) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  filePath = path.join(dataDirectory, 'compass-data.json');
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Store | WorkspaceItem[];
    store = Array.isArray(raw) ? { users: [], items: raw } : { users: raw.users ?? [], items: raw.items ?? [] };
  } catch { store = { users: [], items: [] } }
}
export function register(nickname: string, password: string) {
  const nicknameKey = nickname.trim().toLocaleLowerCase('ru-RU');
  if (store.users.some(user => user.nicknameKey === nicknameKey)) return undefined;
  const salt = crypto.randomBytes(16).toString('hex');
  const user: User = { id: store.users.reduce((m, u) => Math.max(m, u.id), 0) + 1, nickname: nickname.trim(), nicknameKey, passwordHash: hash(password, salt), salt, createdAt: new Date().toISOString() };
  store.users.push(user);
  // Старые локальные записи принадлежат первому созданному профилю.
  if (store.users.length === 1) store.items = store.items.map(item => ({ ...item, ownerId: user.id }));
  save(); return { id: user.id, nickname: user.nickname };
}
export function login(nickname: string, password: string) {
  const user = store.users.find(value => value.nicknameKey === nickname.trim().toLocaleLowerCase('ru-RU'));
  if (!user) return undefined;
  const expected = Buffer.from(user.passwordHash, 'hex'); const actual = Buffer.from(hash(password, user.salt), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual) ? { id: user.id, nickname: user.nickname } : undefined;
}
export function listItems(ownerId: number) { return store.items.filter(i => i.ownerId === ownerId).sort((a, b) => b.id - a.id) }
export function createItem(ownerId: number, input: Omit<WorkspaceItem, 'id' | 'ownerId' | 'createdAt'>): WorkspaceItem {
  const item = { ...input, ownerId, id: store.items.reduce((m, i) => Math.max(m, i.id), 0) + 1, createdAt: new Date().toISOString() }; store.items.push(item); save(); return item;
}
export function updateItem(ownerId: number, id: number, patch: Partial<WorkspaceItem>) { const index = store.items.findIndex(i => i.id === id && i.ownerId === ownerId); if (index < 0) return undefined; store.items[index] = { ...store.items[index], ...patch, id, ownerId }; save(); return store.items[index] }
export function deleteItem(ownerId: number, id: number) { const before = store.items.length; store.items = store.items.filter(i => !(i.id === id && i.ownerId === ownerId)); if (before !== store.items.length) save(); return before !== store.items.length }
