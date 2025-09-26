import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus, FiRefreshCw, FiDownload, FiUpload, FiSettings,
  FiCheckCircle, FiClock, FiAlertTriangle, FiUsers
} from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';

// Import components
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import { CompactLoader } from '../LoadingComponent';

// Firebase imports (assuming these exist)
import { 
  db, collection, getDocs, addDoc, updateDoc, deleteDoc, 
  doc, query, orderBy, onSnapshot, serverTimestamp, where 
} from '../../firebase';

// Styled Components
const TaskManagementContainer = styled.div`
  padding: 24px;
  animation: fadeIn 0.6s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  letter-spacing: -0.02em;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
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
  border-radius: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px ${props => 
      props.primary ? 'rgba(96, 165, 250, 0.3)' : 'rgba(0, 0, 0, 0.2)'
    };
    background: ${props => 
      props.primary ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 
      'rgba(255, 255, 255, 0.1)'
    };
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.06);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(90deg, #60a5fa, #a78bfa)'};
    border-radius: 20px 20px 0 0;
  }
  
  position: relative;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: ${props => props.color || 'linear-gradient(135deg, #60a5fa, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(96, 165, 250, 0.3);
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const TasksContainer = styled.div`
  display: ${props => props.viewMode === 'grid' ? 'grid' : 'flex'};
  ${props => props.viewMode === 'grid' ? `
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    align-items: start;
  ` : `
    flex-direction: column;
    gap: 12px;
  `}
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 40px;
  color: rgba(255, 255, 255, 0.6);
  
  svg {
    font-size: 64px;
    margin-bottom: 24px;
    opacity: 0.3;
  }
  
  h3 {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
  }
  
  p {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

// This will be loaded from Firebase
const defaultAdmins = [
  { id: '1', name: 'Admin Bruker', email: 'admin@whisper.no' },
  { id: '2', name: 'Super Admin', email: 'super@whisper.no' },
  { id: '3', name: 'Moderator', email: 'mod@whisper.no' }
];

// Main Component
const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [admins, setAdmins] = useState(defaultAdmins);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    assignedTo: '',
    priority: '',
    status: '',
    sortBy: 'createdAt'
  });

  // Load tasks and admins from Firebase
  useEffect(() => {
    loadTasks();
    loadAdmins();
  }, []);

  // Filter tasks when filters change
  useEffect(() => {
    filterTasks();
  }, [tasks, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Try to load from Firebase first
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksList);
        setLoading(false);
      }, (error) => {
        console.error('Error loading tasks:', error);
        // Fallback to mock data
        loadMockTasks();
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up tasks listener:', error);
      loadMockTasks();
    }
  };

  const loadAdmins = async () => {
    try {
      // Try to load from Firebase users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'admin'));
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const adminsList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().email,
          email: doc.data().email,
          ...doc.data()
        }));
        setAdmins(adminsList);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      // Keep default admins if Firebase fails
    }
  };

  const loadMockTasks = () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Oppdater brukergrensesnitt',
        description: 'Implementer nye designelementer i admin-panelet',
        assignedTo: 'Admin Bruker',
        priority: 'high',
        status: 'in-progress',
        progress: 65,
        dueDate: '2024-01-15',
        createdAt: '2024-01-01T10:00:00Z',
        tags: ['ui', 'design', 'admin']
      },
      {
        id: '2',
        title: 'Fiks database ytelse',
        description: 'Optimalisere spørringer for bedre responstid',
        assignedTo: 'Super Admin',
        priority: 'urgent',
        status: 'pending',
        progress: 20,
        dueDate: '2024-01-10',
        createdAt: '2024-01-02T14:30:00Z',
        tags: ['database', 'performance']
      },
      {
        id: '3',
        title: 'Implementer notifikasjoner',
        description: 'Legg til push-notifikasjoner for viktige hendelser',
        assignedTo: 'Moderator',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        dueDate: '2024-01-20',
        createdAt: '2024-01-03T09:15:00Z',
        tags: ['notifications', 'features']
      }
    ];
    
    setTasks(mockTasks);
    setLoading(false);
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Assigned to filter
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedTo);
      } else {
        filtered = filtered.filter(task => task.assignedTo === filters.assignedTo);
      }
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Sort
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

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (db) {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        // Refresh tasks to ensure UI updates
        setTimeout(() => loadTasks(), 500);
      } else {
        // Fallback for mock data
        setTasks(prev => [taskData, ...prev]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      // Fallback
      setTasks(prev => [taskData, ...prev]);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      if (db) {
        const taskRef = doc(db, 'tasks', taskData.id);
        await updateDoc(taskRef, {
          ...taskData,
          updatedAt: serverTimestamp()
        });
        // Refresh tasks to ensure UI updates
        setTimeout(() => loadTasks(), 500);
      } else {
        // Fallback for mock data
        setTasks(prev => prev.map(task => 
          task.id === taskData.id ? taskData : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback
      setTasks(prev => prev.map(task => 
        task.id === taskData.id ? taskData : task
      ));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Er du sikker på at du vil slette denne oppgaven?')) return;

    try {
      if (db) {
        await deleteDoc(doc(db, 'tasks', taskId));
        // Refresh tasks to ensure UI updates
        setTimeout(() => loadTasks(), 500);
      } else {
        // Fallback for mock data
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Fallback
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleCompleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed'
      };
      await handleUpdateTask(updatedTask);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    return { total, completed, inProgress, pending, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <TaskManagementContainer>
        <Header>
          <Title>
            <BsKanban /> Oppgavebehandling
          </Title>
        </Header>
        <CompactLoader 
          size="large" 
          text="Laster oppgaver..." 
          color="#60a5fa" 
        />
      </TaskManagementContainer>
    );
  }

  return (
    <TaskManagementContainer>
      <Header>
        <Title>
          <BsKanban /> Oppgavebehandling
        </Title>
        <HeaderActions>
          <ActionButton onClick={() => loadTasks()}>
            <FiRefreshCw /> Oppdater
          </ActionButton>
          <ActionButton>
            <FiDownload /> Eksporter
          </ActionButton>
          <ActionButton primary onClick={() => setShowForm(true)}>
            <FiPlus /> Ny Oppgave
          </ActionButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard color="linear-gradient(90deg, #60a5fa, #3b82f6)">
          <StatIcon color="linear-gradient(135deg, #60a5fa, #3b82f6)">
            <BsKanban />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Totale Oppgaver</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #34d399, #10b981)">
          <StatIcon color="linear-gradient(135deg, #34d399, #10b981)">
            <FiCheckCircle />
          </StatIcon>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Fullførte</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #fbbf24, #f59e0b)">
          <StatIcon color="linear-gradient(135deg, #fbbf24, #f59e0b)">
            <FiClock />
          </StatIcon>
          <StatValue>{stats.inProgress}</StatValue>
          <StatLabel>Pågående</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #ef4444, #dc2626)">
          <StatIcon color="linear-gradient(135deg, #ef4444, #dc2626)">
            <FiAlertTriangle />
          </StatIcon>
          <StatValue>{stats.overdue}</StatValue>
          <StatLabel>Forfalt</StatLabel>
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

      {filteredTasks.length === 0 ? (
        <EmptyState>
          <BsKanban />
          <h3>Ingen oppgaver funnet</h3>
          <p>
            {tasks.length === 0 
              ? 'Opprett din første oppgave for å komme i gang!'
              : 'Prøv å justere filtrene for å se flere oppgaver.'
            }
          </p>
          <ActionButton primary onClick={() => setShowForm(true)}>
            <FiPlus /> Opprett Oppgave
          </ActionButton>
        </EmptyState>
      ) : (
        <TasksContainer viewMode={viewMode}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={(taskId) => handleDeleteTask(taskId)}
              onComplete={(taskId) => handleCompleteTask(taskId)}
              onClick={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
            />
          ))}
        </TasksContainer>
      )}

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
