import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiEdit3, FiTrash2, FiCalendar, FiFlag,
  FiMessageSquare, FiChevronDown, FiChevronUp,
  FiCheck
} from 'react-icons/fi';

// =======================================================
// STYLED COMPONENTS (TaskCard V4.2 - Ultra Transparent)
// =======================================================

const TaskCardContainer = styled.div`
  /* FIKSET: Ultra transparent bakgrunn */
  background: rgba(105, 106, 107, 0.3); 
  backdrop-filter: blur(15px) saturate(150%);
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 20px; 
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.isDragging ? 'grabbing' : 'pointer'};
  min-height: 230px;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.isDragging 
    ? '0 10px 20px rgba(88, 166, 255, 0.4)' 
    : '0 4px 8px rgba(0, 0, 0, 0.2)'
  };
  color: #c9d1d9;

  &:hover {
    background: rgba(22, 27, 34, 0.6);
    border-color: #58a6ff;
    transform: ${props => props.isDragging ? 'none' : 'translateY(-3px)'}; 
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px; 
    background: ${props => 
      props.priority === 'urgent' ? '#ff7b72' :
      props.priority === 'high' ? '#f0b347' :
      props.priority === 'medium' ? '#58a6ff' :
      '#8b949e'
    };
    border-radius: 16px 16px 0 0;
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const TaskTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #c9d1d9;
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${TaskCardContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #30363d;
  border: 1px solid #444c56;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;

  &:hover {
    background: ${props => 
      props.variant === 'edit' ? 'rgba(88, 166, 255, 0.5)' :
      props.variant === 'delete' ? 'rgba(248, 81, 73, 0.5)' :
      props.variant === 'complete' ? 'rgba(46, 160, 67, 0.5)' :
      '#444c56'
    };
    color: #fff;
  }
`;

const TaskContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TaskDescription = styled.p`
  font-size: 14px;
  color: #8b949e;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.expanded ? 'unset' : 3};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReadMoreButton = styled.button`
  color: #58a6ff;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  margin-top: -8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProgressSection = styled.div`
  margin: 12px 0;
  padding: 10px 0;
  border-top: 1px solid #30363d;
  border-bottom: 1px solid #30363d;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #30363d;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => 
    props.progress >= 100 ? '#2ea043' :
    props.progress >= 75 ? '#58a6ff' :
    props.progress >= 50 ? '#f0b347' :
    '#ff7b72'
  };
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8b949e;
  background: #30363d;
  padding: 6px 10px;
  border-radius: 6px;
  
  svg {
    font-size: 14px;
    color: #58a6ff;
  }
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #30363d;
`;

const AssigneeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || '#58a6ff'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d1117;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid #444c56;
`;

const StatusPriorityGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBadge = styled(Badge)`
  background: ${props =>
    props.status === 'completed' ? 'rgba(46, 160, 67, 0.2)' :
    props.status === 'in-progress' ? 'rgba(88, 166, 255, 0.2)' :
    props.status === 'todo' ? 'rgba(240, 179, 71, 0.2)' :
    'rgba(139, 148, 158, 0.2)'
  };
  color: ${props =>
    props.status === 'completed' ? '#34d399' :
    props.status === 'in-progress' ? '#58a6ff' :
    props.status === 'todo' ? '#f0b347' :
    '#8b949e'
  };
`;

const PriorityBadge = styled(Badge)`
  background: ${props =>
    props.priority === 'urgent' ? 'rgba(255, 123, 114, 0.2)' :
    props.priority === 'high' ? 'rgba(240, 179, 71, 0.2)' :
    props.priority === 'medium' ? 'rgba(88, 166, 255, 0.2)' :
    'rgba(139, 148, 158, 0.2)'
  };
  color: ${props =>
    props.priority === 'urgent' ? '#ff7b72' :
    props.priority === 'high' ? '#f0b347' :
    props.priority === 'medium' ? '#58a6ff' :
    '#8b949e'
  };
`;


// =======================================================
// HOVEDKOMPONENT LOGIKK (TaskCard)
// =======================================================

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onTaskUpdate,
  isDragging
}) => {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Ingen frist';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getAssigneeInitials = (name) => {
    if (!name) return '??';
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.toUpperCase().slice(0, 2);
  };

  const getAssigneeColor = (name) => {
    if (!name) return '#8b949e';
    const colors = [
      '#58a6ff', '#a78bfa', '#f472b6', '#34d399', '#f0b347', '#ff7b72'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  const handleMarkComplete = (e) => {
    e.stopPropagation();
    if (task.status === 'completed') return;
    
    const updatedTask = {
      ...task,
      status: 'completed',
      progress: 100
    };
    onTaskUpdate(updatedTask);
  };

  const isDescriptionClipped = task.description && task.description.length > 150;

  return (
    <TaskCardContainer 
      priority={task.priority}
      isDragging={isDragging}
    >
      <TaskHeader>
        <TaskTitle>{task.title}</TaskTitle>
        <TaskActions>
          {task.status !== 'completed' && (
            <ActionButton 
              variant="complete" 
              onClick={handleMarkComplete}
              title="Marker som fullført"
            >
              <FiCheck />
            </ActionButton>
          )}
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
        <TaskDescription expanded={descriptionExpanded}>
          {task.description || 'Ingen beskrivelse tilgjengelig.'}
        </TaskDescription>
        
        {isDescriptionClipped && (
          <ReadMoreButton
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
          >
            {descriptionExpanded ? 'Vis mindre' : 'Vis mer'}
            {descriptionExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </ReadMoreButton>
        )}

        {task.progress !== undefined && (
          <ProgressSection>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px'}}>
                <span style={{fontSize: '13px', color: '#8b949e'}}>Fremdrift</span>
                <span style={{fontSize: '14px', fontWeight: '600', color: '#c9d1d9'}}>
                    {task.progress}%
                </span>
            </div>
            <ProgressBar>
              <ProgressFill progress={task.progress} />
            </ProgressBar>
          </ProgressSection>
        )}

        <TaskMeta>
          <MetaItem>
            <FiCalendar />
            <span>Frist: **{formatDate(task.dueDate)}**</span>
          </MetaItem>
          {task.comments && task.comments.length > 0 && (
            <MetaItem style={{backgroundColor: '#30363d', color: '#f0b347'}}>
              <FiMessageSquare />
              <span>{task.comments.length} kommentar{task.comments.length !== 1 ? 'er' : ''}</span>
            </MetaItem>
          )}
          {task.tags && task.tags.length > 0 && (
            <MetaItem style={{backgroundColor: '#30363d', color: '#a78bfa'}}>
              <span>#{task.tags.join(' #')}</span>
            </MetaItem>
          )}
        </TaskMeta>
      </TaskContent>

      <TaskFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AssigneeAvatar 
            color={getAssigneeColor(task.assignedTo)}
            title={task.assignedTo || 'Ikke tildelt'}
          >
            {getAssigneeInitials(task.assignedTo)}
          </AssigneeAvatar>
          <div style={{ fontSize: '13px', color: '#c9d1d9', fontWeight: '500' }}>
            {task.assignedTo || 'Ikke tildelt'}
          </div>
        </div>

        <StatusPriorityGroup>
          <PriorityBadge priority={task.priority}>
            <FiFlag size={12} />
            {task.priority.toUpperCase()}
          </PriorityBadge>
          <StatusBadge status={task.status}>
            {task.status.toUpperCase()}
          </StatusBadge>
        </StatusPriorityGroup>
      </TaskFooter>
    </TaskCardContainer>
  );
};

export default TaskCard;