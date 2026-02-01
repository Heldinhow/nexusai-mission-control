import React from 'react'
import type { Task } from '../../types/task'
import { Card } from '../common/Card'
import { Loading } from '../common/Loading'
import { TaskHistoryItem } from './TaskHistoryItem'

interface TaskHistoryProps {
  tasks: Task[]
  isLoading: boolean
  currentTaskId?: string
}

export const TaskHistory: React.FC<TaskHistoryProps> = ({ 
  tasks, 
  isLoading, 
  currentTaskId 
}) => {
  if (isLoading) {
    return (
      <Card title="Task History">
        <Loading text="Loading task history..." />
      </Card>
    )
  }

  const historyTasks = tasks.filter(t => t.id !== currentTaskId)

  if (historyTasks.length === 0) {
    return (
      <Card title="Task History">
        <div className="text-center py-8">
          <p className="text-nexus-text-secondary">No previous tasks</p>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="Task History" 
      subtitle={`${historyTasks.length} completed tasks`}
    >
      <div className="space-y-4">
        {historyTasks.slice(0, 10).map((task) => (
          <TaskHistoryItem key={task.id} task={task} />
        ))}
        
        {historyTasks.length > 10 && (
          <p className="text-center text-nexus-text-secondary text-sm pt-4">
            + {historyTasks.length - 10} more tasks
          </p>
        )}
      </div>
    </Card>
  )
}
