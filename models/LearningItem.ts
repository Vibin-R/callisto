import mongoose, { Schema, Document } from 'mongoose';

export interface ISubTopic {
  id: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ITopic {
  id: string;
  title: string;
  isCompleted: boolean;
  subTopics: ISubTopic[];
  deadline?: string;
  notes?: string;
}

export type GoalStatus = 'Not started' | 'In progress' | 'Completed';

export interface ILearningItem extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  topics: ITopic[];
  status: GoalStatus;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubTopicSchema = new Schema<ISubTopic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String },
}, { _id: false });

const TopicSchema = new Schema<ITopic>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  subTopics: [SubTopicSchema],
  deadline: { type: String },
  notes: { type: String },
}, { _id: false });

const LearningItemSchema = new Schema<ILearningItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    topics: {
      type: [TopicSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Not started', 'In progress', 'Completed'],
      default: 'Not started',
    },
    comments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const LearningItem = mongoose.models.LearningItem || mongoose.model<ILearningItem>('LearningItem', LearningItemSchema);

export default LearningItem;

