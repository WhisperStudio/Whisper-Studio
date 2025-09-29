import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FiPlus, FiMoreHorizontal, FiUser, FiMessageSquare,
  FiPaperclip, FiCalendar, FiClock, FiFlag, FiTrash2
} from 'react-icons/fi';
import { db, collection, doc, updateDoc, serverTimestamp } from '../../firebase';

// Styled Components - Vintra Studio Design
const KanbanContainer = styled.div`
  padding: 24px;
  background: rgba(15, 23, 42, 0.95);
  min-height: 100vh;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
`;

const KanbanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const KanbanTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  background: ${props =>
    props.primary ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' :
    'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props =>
    props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 12px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props =>
      props.primary ? 'rgba(96, 165, 250, 0.3)' : 'rgba(0, 0, 0, 0.2)'
    };
    background: ${props =>
      props.primary ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' :
      'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 8px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  min-height: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px 16px 0 0;
`;

const ColumnTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TaskCount = styled.span`
  background: ${props =>
    props.status === 'backlog' ? 'rgba(107, 114, 128, 0.2)' :
    props.status === 'todo' ? 'rgba(59, 130, 246, 0.2)' :
    props.status === 'in-progress' ? 'rgba(245, 158, 11, 0.2)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.2)' :
    'rgba(34, 197, 94, 0.2)'
  };
  color: ${props =>
    props.status === 'backlog' ? '#9ca3af' :
    props.status === 'todo' ? '#60a5fa' :
    props.status === 'in-progress' ? '#fbbf24' :
    props.status === 'review' ? '#a855f7' :
    '#34d399'
  };
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  border: 1px solid ${props =>
    props.status === 'backlog' ? 'rgba(107, 114, 128, 0.3)' :
    props.status === 'todo' ? 'rgba(59, 130, 246, 0.3)' :
    props.status === 'in-progress' ? 'rgba(245, 158, 11, 0.3)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.3)' :
    'rgba(34, 197, 94, 0.3)'
  };
`;

const TasksList = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
`;

const TaskCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-3px);
    border-color: rgba(96, 165, 250, 0.3);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props =>
      props.priority === 'urgent' ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
      props.priority === 'high' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
      props.priority === 'medium' ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
      'linear-gradient(90deg, #6b7280, #4b5563)'
    };
    border-radius: 12px 12px 0 0;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TaskTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
  flex: 1;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;

  ${TaskCard}:hover & {
    opacity: 1;
  }
`;

const ActionIcon = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }
`;

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const TaskDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Assignee = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssigneeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #60a5fa, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const AssigneeName = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const TaskLabels = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PriorityBadge = styled.span`
  padding: 4px 12px;
  background: ${props =>
    props.priority === 'urgent' ? 'rgba(239, 68, 68, 0.15)' :
    props.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' :
    props.priority === 'medium' ? 'rgba(59, 130, 246, 0.15)' :
    'rgba(107, 114, 128, 0.15)'
  };
  color: ${props =>
    props.priority === 'urgent' ? '#ef4444' :
    props.priority === 'high' ? '#f59e0b' :
    props.priority === 'medium' ? '#3b82f6' :
    '#6b7280'
  };
  border: 1px solid ${props =>
    props.priority === 'urgent' ? 'rgba(239, 68, 68, 0.3)' :
    props.priority === 'high' ? 'rgba(245, 158, 11, 0.3)' :
    props.priority === 'medium' ? 'rgba(59, 130, 246, 0.3)' :
    'rgba(107, 114, 128, 0.3)'
  };
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  background: ${props =>
    props.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' :
    props.status === 'in-progress' ? 'rgba(59, 130, 246, 0.15)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.15)' :
    'rgba(107, 114, 128, 0.15)'
  };
  color: ${props =>
    props.status === 'completed' ? '#34d399' :
    props.status === 'in-progress' ? '#60a5fa' :
    props.status === 'review' ? '#a855f7' :
    '#9ca3af'
  };
  border: 1px solid ${props =>
    props.status === 'completed' ? 'rgba(34, 197, 94, 0.3)' :
    props.status === 'in-progress' ? 'rgba(59, 130, 246, 0.3)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.3)' :
    'rgba(107, 114, 128, 0.3)'
  };
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

// Column definitions - GitHub style
const COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'backlog',
    color: '#6e7681',
    limit: null
  },
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    color: '#0969da',
    limit: null
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    color: '#d29922',
    limit: 3
  },
  {
    id: 'review',
    title: 'In Review',
    status: 'review',
    color: '#8250df',
    limit: 2
  },
  {
    id: 'done',
    title: 'Done',
    status: 'completed',
    color: '#238636',
    limit: null
  }
];

const KanbanBoard = ({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit, onTaskCreate }) => {
  const [columns, setColumns] = useState(COLUMNS);

  console.log('🎯 KANBAN BOARD RENDER');
  console.log('Tasks received:', tasks);
  console.log('Task count:', tasks?.length || 0);
  console.log('Sample task:', tasks?.[0]);

  // Group tasks by status
  const getTasksByStatus = (status) => {
    const filtered = tasks.filter(task => task.status === status);
    console.log(`📊 Tasks in ${status} column:`, filtered.length, filtered);
    return filtered;
  };

  // Handle drag end
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Find the task
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Check WIP limit for destination column
    const destTasks = getTasksByStatus(destColumn.status);
    if (destColumn.limit && destTasks.length >= destColumn.limit && task.status !== destColumn.status) {
      alert(`Column "${destColumn.title}" has reached its WIP limit of ${destColumn.limit}`);
      return;
    }

    // Update task status
    const updatedTask = {
      ...task,
      status: destColumn.status,
      updatedAt: serverTimestamp()
    };

    try {
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getAssigneeInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAssigneeColor = (name) => {
    if (!name) return '#6b7280';
    const colors = [
      '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <KanbanContainer>
      <KanbanHeader>
        <KanbanTitle>📋 Vintra Projects</KanbanTitle>
        <HeaderActions>
          <ActionButton onClick={onTaskCreate}>
            <FiPlus /> New Issue
          </ActionButton>
        </HeaderActions>
      </KanbanHeader>

      <DragDropContext onDragEnd={handleDragEnd}>
        <BoardContainer>
          {columns.map(column => (
            <Column key={column.id}>
              <ColumnHeader>
                <ColumnTitle>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: column.color
                    }}
                  />
                  {column.title}
                </ColumnTitle>
                <TaskCount status={column.status}>
                  {getTasksByStatus(column.status).length}
                  {column.limit && ` / ${column.limit}`}
                </TaskCount>
              </ColumnHeader>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <TasksList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver
                        ? 'rgba(96, 165, 250, 0.15)'
                        : 'transparent',
                      border: snapshot.isDraggingOver
                        ? '2px dashed rgba(96, 165, 250, 0.4)'
                        : 'none',
                      borderRadius: '12px',
                      padding: snapshot.isDraggingOver ? '12px' : '0'
                    }}
                  >
                    {getTasksByStatus(column.status).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TaskCard
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            priority={task.priority}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform || ''} rotate(5deg)`
                                : provided.draggableProps.style?.transform
                            }}
                            onClick={() => onTaskEdit(task)}
                          >
                            <TaskHeader>
                              <TaskTitle>{task.title}</TaskTitle>
                              <TaskActions>
                                <ActionIcon
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTaskDelete(task.id);
                                  }}
                                >
                                  <FiTrash2 />
                                </ActionIcon>
                              </TaskActions>
                            </TaskHeader>

                            {task.description && (
                              <TaskMeta>
                                <TaskDescription>{task.description}</TaskDescription>
                              </TaskMeta>
                            )}

                            <TaskFooter>
                              <Assignee>
                                <AssigneeAvatar color={getAssigneeColor(task.assignedTo)}>
                                  {getAssigneeInitials(task.assignedTo)}
                                </AssigneeAvatar>
                                <AssigneeName>
                                  {task.assignedTo || 'Unassigned'}
                                </AssigneeName>
                              </Assignee>

                              <TaskLabels>
                                <PriorityBadge priority={task.priority}>
                                  {task.priority}
                                </PriorityBadge>
                                {task.dueDate && (
                                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {formatDate(task.dueDate)}
                                  </span>
                                )}
                              </TaskLabels>
                            </TaskFooter>
                          </TaskCard>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TasksList>
                )}
              </Droppable>
            </Column>
          ))}
        </BoardContainer>
      </DragDropContext>
    </KanbanContainer>
  );
};

export default KanbanBoard;
