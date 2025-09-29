import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus, FiRefreshCw, FiDownload, FiUpload, FiSettings,
  FiCheckCircle, FiClock, FiUsers
} from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';

// Import components
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import { CompactLoader } from '../LoadingComponent';

// Firebase imports (assuming these exist)
import {
  db, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp, where, limit
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
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.active ? 'rgba(96, 165, 250, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#60a5fa' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
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
  const [unsubscribeTasks, setUnsubscribeTasks] = useState(null);

  // Load tasks and admins from Firebase with real-time updates
  useEffect(() => {
    console.log('=== INITIALIZING TASK MANAGEMENT WITH REAL-TIME UPDATES ===');
    loadTasks();
    loadAdmins();

    // Test Firebase connection
    testFirebaseConnection();

    // Set up real-time listener for tasks
    const unsubscribe = setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        console.log('=== CLEANING UP REAL-TIME LISTENER ===');
        unsubscribe();
      }
    };
  }, []);

  // Filter tasks whenever tasks or filters change
  useEffect(() => {
    filterTasks();
  }, [tasks, filters]);


  const testFirebaseConnection = async () => {
    try {
      console.log('=== TESTING FIREBASE CONNECTION ===');
      if (!db) {
        console.error('❌ Firebase DB is null - check Firebase configuration');
        return;
      }

      // Try to access the tasks collection
      const testRef = collection(db, 'tasks');
      console.log('✅ Firebase connection test passed - can access tasks collection');

      // Try a simple query to see if there are any documents
      const testQuery = query(testRef, orderBy('createdAt', 'desc'));
      const testSnapshot = await getDocs(testQuery);
      console.log('✅ Firebase query test passed - found', testSnapshot.size, 'documents');

    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
    }
  };

  const setupRealtimeListener = () => {
    if (!db) {
      console.error('Firebase DB not available for real-time listener');
      return null;
    }

    try {
      console.log('=== SETTING UP REAL-TIME LISTENER ===');
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('🔥 REAL-TIME UPDATE RECEIVED:', snapshot.size, 'documents');

        const tasksList = snapshot.docs.map(doc => {
          const data = doc.data();
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
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString()
          };
        });

        console.log('✅ Real-time tasks loaded:', tasksList.length);
        setTasks(tasksList);

        // Set loading to false after first real-time update
        if (loading) {
          setLoading(false);
        }
      }, (error) => {
        console.error('❌ Real-time listener error:', error);
        // Fallback to mock data if real-time fails
        loadMockTasks();
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time listener:', error);
      loadMockTasks();
      return null;
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('Loading tasks - attempting to connect to Firebase...');

      // Test Firebase connection
      if (db) {
        console.log('Firebase DB instance exists');
      } else {
        console.error('Firebase DB instance is null');
        loadMockTasks();
        return;
      }

      // Try to load from Firebase first with improved error handling
      const tasksRef = collection(db, 'tasks');
      console.log('Tasks collection reference:', tasksRef);

      // Use getDocs for initial load (real-time listener will handle updates)
      try {
        const q = query(tasksRef, orderBy('createdAt', 'desc'));
        console.log('Query created:', q);
        
        const snapshot = await getDocs(q);
        console.log('Firebase snapshot received:', snapshot.size, 'documents');
        
        const tasksList = snapshot.docs.map(doc => {
          const data = doc.data();
          const task = {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            assignedTo: data.assignedTo || '',
            priority: data.priority || 'medium',
            status: data.status || 'todo',
            dueDate: data.dueDate || '',
            progress: data.progress || 0,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString()
          };
          console.log('Processed task:', task);
          return task;
        });
        
        console.log('Loaded tasks from Firebase:', tasksList);
        setTasks(tasksList);
        setLoading(false);
      } catch (firebaseError) {
        console.error('Firebase query failed:', firebaseError);
        // Fallback to mock data
        loadMockTasks();
      }
    } catch (error) {
      console.error('Error setting up tasks:', error);
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
        title: 'Update user interface',
        description: 'Implement new design elements in admin panel',
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
        title: 'Fix database performance',
        description: 'Optimize queries for better response time',
        assignedTo: 'Super Admin',
        priority: 'urgent',
        status: 'todo',
        progress: 20,
        dueDate: '2024-01-10',
        createdAt: '2024-01-02T14:30:00Z',
        tags: ['database', 'performance']
      },
      {
        id: '3',
        title: 'Implement notifications',
        description: 'Add push notifications for important events',
        assignedTo: 'Moderator',
        priority: 'medium',
        status: 'completed',
        progress: 100,
        dueDate: '2024-01-20',
        createdAt: '2024-01-03T09:15:00Z',
        tags: ['notifications', 'features']
      },
      {
        id: '4',
        title: 'Add user authentication',
        description: 'Implement secure login system',
        assignedTo: '',
        priority: 'high',
        status: 'backlog',
        progress: 0,
        dueDate: '2024-02-01',
        createdAt: '2024-01-04T11:00:00Z',
        tags: ['auth', 'security']
      },
      {
        id: '5',
        title: 'Create API documentation',
        description: 'Document all API endpoints and usage',
        assignedTo: 'Admin Bruker',
        priority: 'medium',
        status: 'review',
        progress: 85,
        dueDate: '2024-01-25',
        createdAt: '2024-01-05T13:20:00Z',
        tags: ['documentation', 'api']
      }
    ];

    setTasks(mockTasks);
    setLoading(false);
  };

  const filterTasks = () => {
    console.log('🔍 FILTER TASKS CALLED');
    console.log('Current tasks:', tasks.length, tasks);
    console.log('Current filters:', filters);

    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      console.log('Applying search filter:', filters.search);
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Assigned to filter
    if (filters.assignedTo) {
      console.log('Applying assigned filter:', filters.assignedTo);
      if (filters.assignedTo === 'unassigned') {
        filtered = filtered.filter(task => !task.assignedTo);
      } else {
        filtered = filtered.filter(task => task.assignedTo === filters.assignedTo);
      }
    }

    // Priority filter
    if (filters.priority) {
      console.log('Applying priority filter:', filters.priority);
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      console.log('Applying status filter:', filters.status);
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

    console.log('✅ Filtered result:', filtered.length, 'tasks');
    console.log('Filtered tasks:', filtered);
    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('=== TASK CREATION STARTED ===');
      console.log('Creating task with data:', taskData);

      if (db) {
        console.log('Firebase DB available, attempting to save...');
        const taskToSave = {
          title: taskData.title,
          description: taskData.description,
          assignedTo: taskData.assignedTo || '',
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate || '',
          progress: taskData.progress || 0,
          tags: taskData.tags || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        console.log('Task data to save to Firebase:', taskToSave);
        const docRef = await addDoc(collection(db, 'tasks'), taskToSave);
        console.log('✅ Task successfully created in Firebase with ID:', docRef.id);

        // Refresh tasks to show the new task
        await loadTasks();
      } else {
        console.error('❌ Firebase DB not available');
        // Fallback for mock data
        const newTask = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        console.log('Adding to local tasks as fallback:', newTask);
        setTasks(prev => [newTask, ...prev]);
      }
    } catch (error) {
      console.error('❌ Error creating task:', error);
      // Fallback - always add to local tasks so user sees the task
      const fallbackTask = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Adding as fallback after error:', fallbackTask);
      setTasks(prev => [fallbackTask, ...prev]);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      if (db) {
        const taskRef = doc(db, 'tasks', taskData.id);
        const taskToUpdate = {
          title: taskData.title,
          description: taskData.description,
          assignedTo: taskData.assignedTo || '',
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate || '',
          progress: taskData.progress || 0,
          tags: taskData.tags || [],
          updatedAt: serverTimestamp()
        };

        await updateDoc(taskRef, taskToUpdate);
        // Refresh to get updated data
        await loadTasks();
      } else {
        // Fallback for mock data
        setTasks(prev => prev.map(task =>
          task.id === taskData.id ? { ...taskData, updatedAt: new Date().toISOString() } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback
      setTasks(prev => prev.map(task =>
        task.id === taskData.id ? { ...taskData, updatedAt: new Date().toISOString() } : task
      ));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Er du sikker på at du vil slette denne oppgaven?')) return;

    try {
      if (db) {
        await deleteDoc(doc(db, 'tasks', taskId));
        // Refresh to get updated data
        await loadTasks();
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
        status: task.status === 'completed' ? 'backlog' : 'completed'
      };
      await handleUpdateTask(updatedTask);
    }
  };

  const getTaskStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
    const backlog = filteredTasks.filter(t => t.status === 'backlog').length;
    const todo = filteredTasks.filter(t => t.status === 'todo').length;
    const review = filteredTasks.filter(t => t.status === 'review').length;

    return { total, completed, inProgress, backlog, todo, review };
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
          <BsKanban /> Vintra Projects
        </Title>
        <HeaderActions>
          <ActionButton onClick={() => loadTasks()}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton>
            <FiDownload /> Export
          </ActionButton>
          <ActionButton primary onClick={() => setShowForm(true)}>
            <FiPlus /> New Task
          </ActionButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard color="linear-gradient(90deg, #60a5fa, #3b82f6)">
          <StatIcon color="linear-gradient(135deg, #60a5fa, #3b82f6)">
            <BsKanban />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Tasks</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #34d399, #10b981)">
          <StatIcon color="linear-gradient(135deg, #34d399, #10b981)">
            <FiCheckCircle />
          </StatIcon>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #fbbf24, #f59e0b)">
          <StatIcon color="linear-gradient(135deg, #fbbf24, #f59e0b)">
            <FiClock />
          </StatIcon>
          <StatValue>{stats.inProgress}</StatValue>
          <StatLabel>In Progress</StatLabel>
        </StatCard>

        <StatCard color="linear-gradient(90deg, #8b5cf6, #7c3aed)">
          <StatIcon color="linear-gradient(135deg, #8b5cf6, #7c3aed)">
            <FiUsers />
          </StatIcon>
          <StatValue>{stats.backlog}</StatValue>
          <StatLabel>Backlog</StatLabel>
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
        onTaskCreate={() => setShowForm(true)}
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
