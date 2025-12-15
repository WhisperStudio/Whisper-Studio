import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  FiPlus, FiRefreshCw, FiCheckCircle, FiClock, FiClipboard
} from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';

// Import components
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm'; 
import TaskFilters from './TaskFilters'; 
import { CompactLoader } from '../LoadingComponent'; 

// Firebase imports (antatt eksisterende)
import {
  db, collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp, 
} from '../../firebase';

// =======================================================
// STYLED COMPONENTS (TaskManagement - Transparent)
// =======================================================

const TaskManagementContainer = styled.div`
  padding: 40px;
  min-height: 100vh;
  color: #c9d1d9;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 30px;
  /* Transparent/Frostet Bakgrunn */
  background: rgba(22, 27, 34, 0.5);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border-bottom: 2px solid #238636;
`;

const Title = styled.h1`
  font-size: 38px;
  font-weight: 900;
  color: #58a6ff;
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0;
  text-shadow: 0 0 5px rgba(88, 166, 255, 0.4);
`;

const ActionButton = styled.button`
  padding: 14px 30px;
  background: ${props => 
    props.primary ? '#238636' : 
    '#30363d' 
  };
  border: none;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => 
      props.primary ? '#2ea043' : 
      '#444c56'
    };
    box-shadow: 0 8px 20px ${props => 
      props.primary ? 'rgba(46, 160, 67, 0.4)' : 'rgba(0, 0, 0, 0.3)'
    };
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  /* Transparent/Frostet Bakgrunn */
  background: rgba(22, 27, 34, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 0 0 2px ${props => props.hoverColor || '#58a6ff'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.color || '#58a6ff'};
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: ${props => props.color || '#58a6ff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #0d1117;
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 30px;
  font-weight: 700;
  color: #c9d1d9;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #8b949e;
`;

// Mock data (for admins)
const defaultAdmins = [
  { id: '1', name: 'Admin Bruker', email: 'admin@whisper.no' },
  { id: '2', name: 'Super Admin', email: 'super@whisper.no' },
  { id: '3', name: 'Moderator', email: 'mod@whisper.no' }
];

// =======================================================
// HOVEDKOMPONENT LOGIKK
// =======================================================

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [admins] = useState(defaultAdmins);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); 
  const [filters, setFilters] = useState({
    search: '',
    assignedTo: '',
    priority: '',
    status: '',
    sortBy: 'order'
  });

  // Datahenting fra Firebase
  const setupRealtimeListener = useCallback(() => {
    if (!db) { setLoading(false); return null; }
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksList = snapshot.docs.map(doc => {
          const data = doc.data();
          const createdAtDate = data.createdAt?.toDate?.() || new Date(data.createdAt);

          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            assignedTo: data.assignedTo || '',
            priority: data.priority || 'medium',
            status: data.status || 'backlog',
            dueDate: data.dueDate || '',
            progress: data.progress || 0,
            tags: data.tags || [],
            comments: data.comments || [],
            order: data.order !== undefined ? data.order : createdAtDate.getTime(), 
            createdAt: createdAtDate.toISOString(),
          };
        });
        setTasks(tasksList);
        if (loading) setLoading(false);
      }, (error) => {
        console.error('❌ Real-time listener error:', error);
        if (loading) setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      if (loading) setLoading(false);
      return null;
    }
  }, [loading]);

  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setupRealtimeListener]);

  // Filtreringslogikk
  useEffect(() => {
    let filtered = Array.isArray(tasks) ? [...tasks] : [];
    
    // Anvender filtere (search, assignedTo, priority)
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedTo);
      } else {
        filtered = filtered.filter(task => task.assignedTo === filters.assignedTo);
      }
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (viewMode !== 'kanban' && filters.status) {
        filtered = filtered.filter(task => task.status === filters.status);
    }
    
    // Sortering
    if (viewMode === 'kanban') {
        filtered.sort((a, b) => {
            if (a.status !== b.status) {
                return a.status.localeCompare(b.status); 
            }
            return a.order - b.order;
        });
    } else {
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
              case 'title':
                return a.title.localeCompare(b.title);
              case 'priority':
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              case 'dueDate':
                return new Date(a.dueDate) - new Date(b.dueDate);
              default:
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });
    }

    setFilteredTasks(filtered);
  }, [tasks, filters, viewMode]);

  // Hjelpefunksjon for å finne neste 'order' verdi
  const getMaxOrder = (status) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const tasksInStatus = safeTasks.filter(t => t.status === status);
    if (tasksInStatus.length === 0) return 1000;
    return Math.max(...tasksInStatus.map(t => t.order || 0)) + 1000;
  };

  const handleCreateTask = async (taskData) => { 
    try {
      if (db) {
        const initialStatus = taskData.status || 'backlog';
        const newOrder = getMaxOrder(initialStatus);

        const taskToSave = {
          ...taskData,
          status: initialStatus,
          order: newOrder, 
          comments: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'tasks'), taskToSave);
      } 
    } catch (error) {
      console.error('❌ Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      if (db) {
        const taskRef = doc(db, 'tasks', taskData.id);
        const taskToUpdate = {
          ...taskData,
          updatedAt: serverTimestamp() 
        };
        delete taskToUpdate.id; 
        delete taskToUpdate.createdAt;
        delete taskToUpdate.updatedAt; 

        await updateDoc(taskRef, taskToUpdate);
      } 
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Er du sikker på at du vil slette denne oppgaven?')) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'tasks', taskId));
      } 
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({...task}); 
    setShowForm(true);
  };

  const getTaskStats = () => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const total = safeTasks.length;
    const completed = safeTasks.filter(t => t.status === 'completed').length;
    const inProgress = safeTasks.filter(t => t.status === 'in-progress').length;
    const todo = safeTasks.filter(t => t.status === 'todo').length;
    const backlog = safeTasks.filter(t => t.status === 'backlog').length;
    return { total, completed, inProgress, backlog, todo };
  };

  const stats = getTaskStats();
  
  if (loading) {
    return (
      <TaskManagementContainer>
        <CompactLoader 
          size="large" 
          text="Laster oppgaver og administratorer..." 
          color="#238636" 
        />
      </TaskManagementContainer>
    );
  }

  return (
    <TaskManagementContainer>
      <Header>
        <Title>
          <BsKanban size={30} /> Vintra Projects Dashboard
        </Title>
        <div style={{ display: 'flex', gap: '15px' }}>
            <ActionButton onClick={setupRealtimeListener}> 
                <FiRefreshCw /> Refresh Data
            </ActionButton>
            <ActionButton primary onClick={() => {
                setEditingTask(null);
                setShowForm(true);
            }}>
                <FiPlus /> New Task
            </ActionButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard color="#58a6ff" hoverColor="#58a6ff">
          <StatIcon color="#58a6ff">
            <BsKanban />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Tasks</StatLabel>
        </StatCard>

        <StatCard color="#2ea043" hoverColor="#2ea043">
          <StatIcon color="#2ea043">
            <FiCheckCircle />
          </StatIcon>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>

        <StatCard color="#f59e0b" hoverColor="#f59e0b">
          <StatIcon color="#f59e0b">
            <FiClock />
          </StatIcon>
          <StatValue>{stats.inProgress}</StatValue>
          <StatLabel>In Progress</StatLabel>
        </StatCard>
        
        <StatCard color="#a78bfa" hoverColor="#a78bfa">
          <StatIcon color="#a78bfa">
            <FiClipboard />
          </StatIcon>
          <StatValue>{stats.todo + stats.backlog}</StatValue>
          <StatLabel>To Do / Backlog</StatLabel>
        </StatCard>
      </StatsGrid>

      <TaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        admins={admins}
        taskCount={filteredTasks.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <KanbanBoard
        tasks={filteredTasks}
        viewMode={viewMode}
        onTaskUpdate={handleUpdateTask}
        onTaskDelete={handleDeleteTask}
        onTaskEdit={handleEditTask}
        onTaskCreate={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      />

      <TaskForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        admins={admins}
      />
    </TaskManagementContainer>
  );
};

export default TaskManagement;