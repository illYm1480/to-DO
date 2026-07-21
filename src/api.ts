import type { FinanceGoal, FinanceTransaction, ItemKind, TransactionType, WorkspaceItem } from './types';
const baseUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:47831/api' : '/api';
let token = '';
async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || 'Произошла ошибка');
  return data;
}
export async function authenticate(mode: 'login' | 'register', nickname: string, password: string) { const data = await request(`/auth/${mode}`, { method:'POST', body:JSON.stringify({ nickname, password }) }); token = data.token; return data.user as { id:number; nickname:string } }
export function logout() { token = '' }
export async function getItems(): Promise<WorkspaceItem[]> { return request('/items') }
export async function addItem(input: { kind:ItemKind; title:string; description:string; dueDate:string|null }) { return request('/items', { method:'POST', body:JSON.stringify(input) }) as Promise<WorkspaceItem> }
export async function toggleItem(item: WorkspaceItem) { return request(`/items/${item.id}`, { method:'PATCH', body:JSON.stringify({ status:item.status === 'done' ? 'active' : 'done' }) }) as Promise<WorkspaceItem> }
export async function removeItem(id:number) { await request(`/items/${id}`, { method:'DELETE' }) }
export async function getTransactions():Promise<FinanceTransaction[]>{return request('/finance/transactions')}
export async function addTransaction(input:{type:TransactionType;amount:number;category:string;note:string;transactionDate:string}){return request('/finance/transactions',{method:'POST',body:JSON.stringify(input)}) as Promise<FinanceTransaction>}
export async function removeTransaction(id:number){await request(`/finance/transactions/${id}`,{method:'DELETE'})}
export async function getFinanceGoals():Promise<FinanceGoal[]>{return request('/finance/goals')}
export async function addFinanceGoal(input:{title:string;targetAmount:number;savedAmount:number;deadline:string|null}){return request('/finance/goals',{method:'POST',body:JSON.stringify(input)}) as Promise<FinanceGoal>}
export async function contributeToGoal(id:number,amount:number){return request(`/finance/goals/${id}/contribute`,{method:'POST',body:JSON.stringify({amount})}) as Promise<FinanceGoal>}
export async function removeFinanceGoal(id:number){await request(`/finance/goals/${id}`,{method:'DELETE'})}
