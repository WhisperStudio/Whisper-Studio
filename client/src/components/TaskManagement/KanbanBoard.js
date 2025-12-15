import React from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FiPlus, FiCheck, FiCpu, FiMonitor, FiClipboard, FiAlertTriangle
} from 'react-icons/fi';
import TaskCard from './TaskCard';

// =======================================================
// STYLED COMPONENTS (KanbanBoard V4.0)
// =======================================================

const BoardWrapper = styled.div`
  padding: 24px 0;
  display: ${props => props.viewMode === 'kanban' ? 'block' : 'none'};
`;

const GridWrapper = styled.div`
  display: ${props => props.viewMode !== 'kanban' ? 'grid' : 'none'};
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px 0;
  align-items: start;
`;

const BoardContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding-bottom: 20px;
  gap: 24px;
  min-height: 80vh;
  align-items: flex-start;
  user-select: none;
  
  /* Tilpasset scroller for å matche tema */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
  }
`;

const Column = styled.div`
  background: #41414eff;
  border: 1px solid #30363d;
  border-radius: 10px;
  min-width: 380px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 3px;
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #30363d;
  background: #32373dff; 
  border-radius: 10px 10px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ColumnTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color || '#c9d1d9'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TaskCount = styled.span`
  background: ${props =>
    props.isLimit ? 'rgba(248, 81, 73, 0.3)' : 
    '#30363d'
  };
  color: ${props =>
    props.isLimit ? '#ff7b72' :
    '#c9d1d9'
  };
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TasksList = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
  transition: background-color 0.2s ease;
  background: ${props => props.isDraggingOver ? 'rgba(88, 166, 255, 0.1)' : 'transparent'};
`;

const AddTaskButton = styled.button`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background: #30363d;
  border: 1px dashed #444c56;
  border-radius: 8px;
  color: #58a6ff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #444c56;
    border-color: #58a6ff;
  }
`;

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', status: 'backlog', color: '#8b949e', icon: FiClipboard, limit: null },
  { id: 'todo', title: 'To Do', status: 'todo', color: '#58a6ff', icon: FiCpu, limit: null },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: '#f0b347', icon: FiMonitor, limit: 3 },
  { id: 'review', title: 'In Review', status: 'review', color: '#a78bfa', icon: FiCheck, limit: 2 },
  { id: 'completed', title: 'Done', status: 'completed', color: '#2ea043', icon: FiCheck, limit: null }
];

// HJELPEFUNKSJON: Sikrer at dnd-stilen blir brukt korrekt og synliggjør kortet
const getStyle = (style, snapshot) => {
  if (!snapshot.isDragging) {
    return style;
  }
  
  return {
    ...style,
    // Kritisk for synlighet under dra
    zIndex: 9999,
    transform: style.transform, 
    // Visuell effekt under dra
    boxShadow: '0 10px 30px rgba(88, 166, 255, 0.5)',
    transition: 'none !important'
  };
};

// =======================================================
// DRA & SLIPP LOGIKK
// =======================================================

const calculateNewOrder = (tasksInDestColumn, destinationIndex) => {
  const minOrder = 1000;
  
  if (tasksInDestColumn.length === 0) return minOrder;

  const prevTask = tasksInDestColumn[destinationIndex - 1];
  const nextTask = tasksInDestColumn[destinationIndex];
  
  let prevOrder = prevTask ? prevTask.order : 0;
  let nextOrder = nextTask ? nextTask.order : prevOrder + minOrder; 

  if (!prevTask) return nextOrder / 2;
  if (!nextTask) return prevOrder + minOrder;
  
  return (prevOrder + nextOrder) / 2;
};


// =======================================================
// HOVEDKOMPONENT LOGIKK (KanbanBoard)
// =======================================================

const KanbanBoard = ({ 
  tasks, 
  viewMode, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit, 
  onTaskCreate
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const getTasksByStatus = (status) => {
    return safeTasks
      .filter(task => task.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const destColumn = COLUMNS.find(col => col.id === destination.droppableId);
    const taskToMove = safeTasks.find(t => t.id === draggableId);
    if (!destColumn || !taskToMove) return;

    // 1. WIP Limit Sjekk
    const destTasks = getTasksByStatus(destColumn.status);
    if (destColumn.limit && destTasks.length >= destColumn.limit && taskToMove.status !== destColumn.status) {
      alert(`Kolonnen "${destColumn.title}" har nådd sin WIP-grense på ${destColumn.limit}. Flytt en oppgave ut først.`);
      return;
    }
    
    // 2. Beregn ny 'order'
    const newStatus = destColumn.status;
    const tasksInNewColumn = safeTasks.filter(t => t.status === newStatus && t.id !== draggableId)
                                  .sort((a, b) => (a.order || 0) - (b.order || 0));
    const newOrder = calculateNewOrder(tasksInNewColumn, destination.index);

    const newProgress = newStatus === 'completed' ? 100 : taskToMove.progress;

    const updatedTask = {
      ...taskToMove,
      status: newStatus,
      progress: newProgress,
      order: newOrder, 
    };

    try {
      await onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('❌ Oppdatering av oppgave status feilet:', error);
      alert('Klarte ikke å oppdatere oppgaven. Se konsollen for detaljer.');
    }
  };

  // Grid/List View
  if (viewMode !== 'kanban') {
    return (
      <GridWrapper viewMode={viewMode}>
        {safeTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onTaskUpdate={onTaskUpdate} 
            isDragging={false}
          />
        ))}
        {safeTasks.length === 0 && (
           <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#8b949e', padding: '40px 0'}}>
             Ingen oppgaver matcher filteret.
           </div>
        )}
      </GridWrapper>
    );
  }
  
  // EKSTRA SIKKERHET: Sjekk at COLUMNS er et array før mapping
  const safeColumns = Array.isArray(COLUMNS) ? COLUMNS : [];
  
  // Kanban View
  return (
    <BoardWrapper viewMode={viewMode}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <BoardContainer>
          {safeColumns.map(column => {
            const columnTasks = getTasksByStatus(column.status);
            const isLimitReached = column.limit && columnTasks.length >= column.limit;
            const IconComponent = column.icon;
            
            return (
              <Column key={column.id}>
                <ColumnHeader>
                  <ColumnTitle color={column.color}>
                    <IconComponent size={20} />
                    {column.title}
                  </ColumnTitle>
                  <TaskCount status={column.status} isLimit={isLimitReached}>
                    {isLimitReached && <FiAlertTriangle size={14} />}
                    {columnTasks.length}
                    {column.limit && ` / ${column.limit}`}
                  </TaskCount>
                </ColumnHeader>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <TasksList
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      isDraggingOver={snapshot.isDraggingOver}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getStyle(
                                {
                                  ...provided.draggableProps.style,
                                  marginBottom: '16px',
                                },
                                snapshot
                              )}
                              onClick={() => onTaskEdit(task)}
                            >
                              <TaskCard
                                task={task}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                                onTaskUpdate={onTaskUpdate}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <AddTaskButton onClick={onTaskCreate}>
                         <FiPlus /> Ny {column.title} Oppgave
                      </AddTaskButton>
                    </TasksList>
                  )}
                </Droppable>
              </Column>
            );
          })}
        </BoardContainer>
      </DragDropContext>
    </BoardWrapper>
  );
};

export default KanbanBoard;