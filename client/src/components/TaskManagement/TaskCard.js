import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiEdit3, FiTrash2, FiUser, FiCalendar, FiClock, FiFlag,
  FiMoreVertical, FiCheck, FiX, FiMessageSquare, FiPercent,
  FiTrendingUp, FiPlay, FiPause
} from 'react-icons/fi';

// Styled Components
const TaskCardContainer = styled.div`
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
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
    border-radius: 20px 20px 0 0;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TaskTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${TaskCardContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    background: ${props => 
      props.variant === 'edit' ? 'rgba(59, 130, 246, 0.2)' :
      props.variant === 'delete' ? 'rgba(239, 68, 68, 0.2)' :
      props.variant === 'complete' ? 'rgba(34, 197, 94, 0.2)' :
      'rgba(255, 255, 255, 0.1)'
    };
    color: ${props => 
      props.variant === 'edit' ? '#3b82f6' :
      props.variant === 'delete' ? '#ef4444' :
      props.variant === 'complete' ? '#22c55e' :
      '#fff'
    };
    transform: scale(1.1);
  }
`;

const TaskDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  
  svg {
    font-size: 12px;
  }
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AssigneeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #60a5fa, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  background: ${props =>
    props.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' :
    props.status === 'in-progress' ? 'rgba(59, 130, 246, 0.15)' :
    props.status === 'todo' ? 'rgba(245, 158, 11, 0.15)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.15)' :
    props.status === 'backlog' ? 'rgba(107, 114, 128, 0.15)' :
    'rgba(107, 114, 128, 0.15)'
  };
  color: ${props =>
    props.status === 'completed' ? '#22c55e' :
    props.status === 'in-progress' ? '#3b82f6' :
    props.status === 'todo' ? '#f59e0b' :
    props.status === 'review' ? '#a855f7' :
    props.status === 'backlog' ? '#6b7280' :
    '#6b7280'
  };
  border: 1px solid ${props =>
    props.status === 'completed' ? 'rgba(34, 197, 94, 0.3)' :
    props.status === 'in-progress' ? 'rgba(59, 130, 246, 0.3)' :
    props.status === 'todo' ? 'rgba(245, 158, 11, 0.3)' :
    props.status === 'review' ? 'rgba(168, 85, 247, 0.3)' :
    props.status === 'backlog' ? 'rgba(107, 114, 128, 0.3)' :
    'rgba(107, 114, 128, 0.3)'
  };
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
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
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProgressSection = styled.div`
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProgressValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => 
    props.progress >= 100 ? '#22c55e' :
    props.progress >= 75 ? '#3b82f6' :
    props.progress >= 50 ? '#f59e0b' :
    '#ef4444'
  };
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => 
    props.progress >= 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
    props.progress >= 75 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
    props.progress >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
    'linear-gradient(90deg, #ef4444, #dc2626)'
  };
  border-radius: 3px;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const TaskContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// Main Component
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete, 
  onAssign,
  onClick 
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Ingen frist';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAssigneeInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAssigneeColor = (name) => {
    if (!name) return '#6b7280';
    const colors = [
      'linear-gradient(135deg, #60a5fa, #3b82f6)',
      'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      'linear-gradient(135deg, #f472b6, #ec4899)',
      'linear-gradient(135deg, #34d399, #10b981)',
      'linear-gradient(135deg, #fbbf24, #f59e0b)',
      'linear-gradient(135deg, #fb7185, #f43f5e)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    onClick && onClick(task);
  };

  return (
    <TaskCardContainer 
      priority={task.priority}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <TaskHeader>
        <TaskTitle>{task.title}</TaskTitle>
        <TaskActions>
          <ActionButton 
            variant="complete" 
            onClick={(e) => {
              e.stopPropagation();
              onComplete && onComplete(task.id);
            }}
            title="Marker som fullført"
          >
            <FiCheck />
          </ActionButton>
          <ActionButton 
            variant="edit" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(task);
            }}
            title="Rediger oppgave"
          >
            <FiEdit3 />
          </ActionButton>
          <ActionButton 
            variant="delete" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(task.id);
            }}
            title="Slett oppgave"
          >
            <FiTrash2 />
          </ActionButton>
        </TaskActions>
      </TaskHeader>

      <TaskContent>
        <TaskDescription>{task.description}</TaskDescription>

        {task.progress !== undefined && (
          <ProgressSection>
            <ProgressHeader>
              <ProgressLabel>
                <FiPercent />
                Fremdrift
              </ProgressLabel>
              <ProgressValue progress={task.progress}>
                {task.progress}%
              </ProgressValue>
            </ProgressHeader>
            <ProgressBar>
              <ProgressFill progress={task.progress} />
            </ProgressBar>
          </ProgressSection>
        )}

        <TaskMeta>
        <MetaItem>
          <FiCalendar />
          <span>Frist: {formatDate(task.dueDate)}</span>
        </MetaItem>
        <MetaItem>
          <FiClock />
          <span>Opprettet: {formatDate(task.createdAt)}</span>
        </MetaItem>
        {task.tags && task.tags.length > 0 && (
          <MetaItem>
            <span>#{task.tags.join(' #')}</span>
          </MetaItem>
        )}
        </TaskMeta>
      </TaskContent>

      <TaskFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AssigneeAvatar 
            color={getAssigneeColor(task.assignedTo)}
            title={task.assignedTo || 'Ikke tildelt'}
          >
            {getAssigneeInitials(task.assignedTo)}
          </AssigneeAvatar>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Tildelt til
            </div>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>
              {task.assignedTo || 'Ikke tildelt'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PriorityBadge priority={task.priority}>
            <FiFlag />
            {task.priority}
          </PriorityBadge>
          <StatusBadge status={task.status}>
            {task.status === 'completed' ? 'Fullført' :
             task.status === 'in-progress' ? 'Pågår' :
             task.status === 'todo' ? 'Todo' :
             task.status === 'review' ? 'Review' :
             task.status === 'backlog' ? 'Backlog' :
             'Ny'}
          </StatusBadge>
        </div>
      </TaskFooter>
    </TaskCardContainer>
  );
};

export default TaskCard;
