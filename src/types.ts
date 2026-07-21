export type ItemKind = 'goal' | 'task' | 'plan' | 'note';
export interface WorkspaceItem { id: number; ownerId: number; kind: ItemKind; title: string; description: string; status: string; dueDate: string | null; createdAt: string }
export type TransactionType = 'expense' | 'income';
export interface FinanceTransaction { id:number; ownerId:number; type:TransactionType; amount:number; category:string; note:string; transactionDate:string; createdAt:string }
