import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db, collection, getDocs, doc, deleteDoc, updateDoc,
  serverTimestamp, onSnapshot, getDoc
} from '../../firebase';
import { auth } from '../../firebase';
import { 
  FiUsers, FiUserPlus, 
  FiSearch, FiRefreshCw, FiAlertTriangle,
  
} from 'react-icons/fi';
import { BsShieldCheck, BsPerson, BsPersonBadge, BsAward } from 'react-icons/bs';
import { CompactLoader } from '../LoadingComponent';
import UserCard from './UserCard';
import PermissionModal from './PermissionModal';
import AddUserModal from './AddUserModal';

// Styled Components
const Container = styled.div`
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
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px ${props => 
      props.primary ? 'rgba(96, 165, 250, 0.3)' : 'rgba(0, 0, 0, 0.2)'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' : 
    'transparent'
  };
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' : 
      'rgba(255, 255, 255, 0.05)'
    };
    color: #fff;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 24px;
  
  input {
    width: 100%;
    padding: 16px 20px 16px 50px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #fff;
    font-size: 14px;
    transition: all 0.3s;
    
    &:focus {
      outline: none;
      border-color: #60a5fa;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  svg {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(90deg, #60a5fa, #a78bfa)'};
  }
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

// Role definitions
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPPORT: 'support',
  USER: 'user',
  PENDING: 'pending'
};

const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.SUPPORT]: 2,
  [ROLES.USER]: 1
};

const PERMISSIONS = {
  dashboard: 'Dashboard',
  chat: 'Chat Management',
  analytics: 'Analytics',
  users: 'User Management',
  admins: 'Admin Management',
  settings: 'System Settings',
  tasks: 'Task Management',
  tickets: 'Support Tickets',
  bugs: 'Bug Reports',
  database: 'Database Access',
  security: 'Security Center',
  aiBot: 'AI Bot Config'
};

// Main Component
const RoleManagement = ({ isOwnerView = false, isAdminView = false }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.USER);

  useEffect(() => {
    loadUsers();
    checkCurrentUserRole();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, activeTab, filterUsers]);

  const checkCurrentUserRole = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Check if user is owner (vintra)
      const ownerEmails = [
        'vintrastudio@gmail.com',
        'vintra@whisper.no',
        'vintra@example.com'
      ];
      
      if (ownerEmails.includes(currentUser.email?.toLowerCase())) {
        setCurrentUserRole(ROLES.OWNER);
        return;
      }

      // Check user role from database
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUserRole(userData.role || ROLES.USER);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('RoleManagement: Loading users from Firebase...');
      const usersRef = collection(db, 'users');
      
      // Don't use orderBy initially to avoid issues with missing fields
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        console.log('RoleManagement: Users snapshot received, count:', snapshot.size);
        
        const usersList = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('RoleManagement: User loaded:', doc.id, data.email, data.role);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastActivity: data.lastActivity?.toDate() || new Date()
          };
        });

        // Set vintra emails as owner if exists
        const ownerEmails = [
          'vintrastudio@gmail.com',
          'vintra@whisper.no',
          'vintra@example.com'
        ];

        const updatedUsers = usersList.map(user => {
          if (ownerEmails.includes(user.email?.toLowerCase())) {
            return { ...user, role: ROLES.OWNER };
          }
          // Ensure role is set, default to 'pending' if not set
          if (!user.role) {
            return { ...user, role: ROLES.PENDING };
          }
          return user;
        });
        
        // Sort by createdAt after loading
        updatedUsers.sort((a, b) => b.createdAt - a.createdAt);
        
        console.log('RoleManagement: Total users loaded:', updatedUsers.length);
        setUsers(updatedUsers);
        setLoading(false);
      }, (error) => {
        console.error('RoleManagement: Error in snapshot listener:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('RoleManagement: Error loading users:', error);
      setLoading(false);
      
      // Try to load without orderBy if there's an error
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        console.log('RoleManagement: Fallback load, users count:', snapshot.size);
        
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastActivity: doc.data().lastActivity?.toDate() || new Date()
        }));
        
        const ownerEmails = [
          'vintrastudio@gmail.com',
          'vintra@whisper.no',
          'vintra@example.com'
        ];
        
        const updatedUsers = usersList.map(user => {
          if (ownerEmails.includes(user.email?.toLowerCase())) {
            return { ...user, role: ROLES.OWNER };
          }
          if (!user.role) {
            return { ...user, role: ROLES.PENDING };
          }
          return user;
        });
        
        updatedUsers.sort((a, b) => b.createdAt - a.createdAt);
        setUsers(updatedUsers);
        setLoading(false);
      } catch (fallbackError) {
        console.error('RoleManagement: Fallback also failed:', fallbackError);
      }
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter based on view mode
    if (isAdminView) {
      // Admins can only see support and regular users
      filtered = filtered.filter(user => 
        user.role === ROLES.SUPPORT || 
        user.role === ROLES.USER || 
        !user.role
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(user => user.role === ROLES.PENDING);
        break;
      case 'owners':
        if (!isAdminView) {
          filtered = filtered.filter(user => user.role === ROLES.OWNER);
        }
        break;
      case 'admins':
        if (!isAdminView) {
          filtered = filtered.filter(user => user.role === ROLES.ADMIN);
        }
        break;
      case 'support':
        filtered = filtered.filter(user => user.role === ROLES.SUPPORT);
        break;
      case 'users':
        filtered = filtered.filter(user => user.role === ROLES.USER);
        break;
      default:
        // Show all
        break;
    }

    setFilteredUsers(filtered);
  };

  const canManageUser = (targetUser) => {
    // Owner view - can manage everyone
    if (isOwnerView && currentUserRole === ROLES.OWNER) return true;
    
    // Admin view - can only manage support and users
    if (isAdminView && currentUserRole === ROLES.ADMIN) {
      return targetUser.role === ROLES.SUPPORT || 
             targetUser.role === ROLES.USER || 
             !targetUser.role;
    }
    
    const currentLevel = ROLE_HIERARCHY[currentUserRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetUser.role || ROLES.USER] || 0;
    
    return currentLevel > targetLevel;
  };

  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'owner':
        return ['dashboard', 'realtime', 'analytics', 'chat', 'aiBot', 'tickets', 'server', 'database', 'security', 'tasks', 'bugs', 'admins', 'users', 'settings'];
      case 'admin':
        return ['dashboard', 'realtime', 'analytics', 'chat', 'aiBot', 'tickets', 'server', 'database', 'security', 'tasks', 'bugs', 'admins', 'settings'];
      case 'support':
        return []; // Support får ingen tilgang som standard - admin må gi tilgang
      case 'user':
        return []; // Vanlige brukere får ingen tilgang som standard
      default:
        return [];
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        permissions: getDefaultPermissions(newRole),
        updatedAt: serverTimestamp()
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        permissions: permissions,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Feil ved oppdatering av tillatelser');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Er du sikker på at du vil slette denne brukeren? Brukeren vil miste all tilgang til systemet.')) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Note: We cannot delete the user from Firebase Auth directly
      // The user will still be able to sign in with Google, but won't have access
      // as their Firestore document is deleted
      
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Feil ved sletting av bruker');
    }
  };
  const getStats = () => {
    const owners = users.filter(u => u.role === ROLES.OWNER).length;
    const admins = users.filter(u => u.role === ROLES.ADMIN).length;
    const support = users.filter(u => u.role === ROLES.SUPPORT).length;
    const regularUsers = users.filter(u => u.role === ROLES.USER).length;
    const pending = users.filter(u => u.role === ROLES.PENDING).length;
    
    return { 
      total: users.length,
      owners,
      admins,
      support,
      users: regularUsers,
      pending
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>
            <FiUsers /> Bruker & Rolle Administrasjon
          </Title>
        </Header>
        <CompactLoader size="large" text="Laster brukere..." />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiUsers /> {isOwnerView ? 'Brukeradministrasjon (Owner)' : isAdminView ? 'Support & Brukeradministrasjon' : 'Bruker & Rolle Administrasjon'}
        </Title>
        <HeaderActions>
          <ActionButton onClick={() => loadUsers()}>
            <FiRefreshCw /> Oppdater
          </ActionButton>
          {(currentUserRole === ROLES.OWNER || currentUserRole === ROLES.ADMIN) && (
            <ActionButton primary onClick={() => setShowAddModal(true)}>
              <FiUserPlus /> Legg til bruker
            </ActionButton>
          )}
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard color="linear-gradient(90deg, #fbbf24, #f59e0b)">
          <StatValue>{stats.owners}</StatValue>
          <StatLabel>Eiere</StatLabel>
        </StatCard>
        <StatCard color="linear-gradient(90deg, #60a5fa, #3b82f6)">
          <StatValue>{stats.admins}</StatValue>
          <StatLabel>Administratorer</StatLabel>
        </StatCard>
        <StatCard color="linear-gradient(90deg, #22c55e, #16a34a)">
          <StatValue>{stats.support}</StatValue>
          <StatLabel>Support</StatLabel>
        </StatCard>
        <StatCard color="linear-gradient(90deg, #6b7280, #4b5563)">
          <StatValue>{stats.users}</StatValue>
          <StatLabel>Brukere</StatLabel>
        </StatCard>
        {stats.pending > 0 && (
          <StatCard color="linear-gradient(90deg, #ef4444, #dc2626)">
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Venter godkjenning</StatLabel>
          </StatCard>
        )}
      </StatsGrid>

      <TabContainer>
        <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          <FiUsers /> Alle ({isAdminView ? stats.support + stats.users + stats.pending : stats.total})
        </Tab>
        {stats.pending > 0 && (
          <Tab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
            <FiAlertTriangle /> Venter ({stats.pending})
          </Tab>
        )}
        {!isAdminView && (
          <Tab active={activeTab === 'owners'} onClick={() => setActiveTab('owners')}>
            <BsAward /> Eiere ({stats.owners})
          </Tab>
        )}
        {!isAdminView && (
          <Tab active={activeTab === 'admins'} onClick={() => setActiveTab('admins')}>
            <BsShieldCheck /> Admins ({stats.admins})
          </Tab>
        )}
        <Tab active={activeTab === 'support'} onClick={() => setActiveTab('support')}>
          <BsPersonBadge /> Support ({stats.support})
        </Tab>
        <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <BsPerson /> Brukere ({stats.users})
        </Tab>
      </TabContainer>

      <SearchBar>
        <FiSearch />
        <input
          type="text"
          placeholder="Søk etter navn eller e-post..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <UserGrid>
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            currentUserRole={currentUserRole}
            canManage={canManageUser(user)}
            onUpdateRole={updateUserRole}
            onUpdatePermissions={() => {
              setSelectedUser(user);
              setShowPermissionModal(true);
            }}
            onDelete={() => {
              if (window.confirm(`Er du sikker på at du vil slette ${user.email}?`)) {
                deleteUser(user.id);
              }
            }}
          />
        ))}
      </UserGrid>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={loadUsers}
          currentUserRole={currentUserRole}
        />
      )}

      {showPermissionModal && selectedUser && (
        <PermissionModal
          user={selectedUser}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedUser(null);
          }}
          onSave={(permissions) => {
            updateUserPermissions(selectedUser.id, permissions);
            setShowPermissionModal(false);
            setSelectedUser(null);
          }}
          availablePermissions={PERMISSIONS}
        />
      )}
    </Container>
  );
};

export default RoleManagement;
