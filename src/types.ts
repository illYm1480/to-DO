export type ItemKind = 'goal' | 'task' | 'plan' | 'note';
export interface WorkspaceItem { id: number; ownerId: number; kind: ItemKind; title: string; description: string; status: string; dueDate: string | null; createdAt: string }
