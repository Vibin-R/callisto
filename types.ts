
export interface SubTopic {
  id: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
}

export interface Topic {
  id: string;
  title: string;
  isCompleted: boolean;
  subTopics: SubTopic[];
  deadline?: string; // ISO date string YYYY-MM-DD
  notes?: string;
}

export type GoalStatus = 'Not started' | 'In progress' | 'Completed';

export interface LearningItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  topics: Topic[];
  createdAt: number;
  status: GoalStatus;
  comments?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface LearningState {
  categories: Category[];
  items: LearningItem[];
}
