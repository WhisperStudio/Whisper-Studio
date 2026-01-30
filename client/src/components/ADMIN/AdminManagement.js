import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  onSnapshot,
  getDoc
} from '../../firebase';
import { auth, createUserWithEmailAndPassword } from '../../firebase';
import { 
  FiUsers, 
  FiUserPlus, 
  FiUserMinus, 
  FiMail, 
  FiCalendar, 
  FiUser,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiShield,
  FiShieldOff,
  FiEye,
  FiSettings,
  FiStar,
  FiTrash2,
  FiAlertTriangle,
  FiEdit3,
  FiCheck,
  FiX,
  FiLock,
  FiUnlock,
  FiCrown,
  FiUserCheck
} from 'react-icons/fi';
import { BsCrown, BsShieldCheck, BsPerson } from 'react-icons/bs';
import { CompactLoader } from '../LoadingComponent';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #0a0f1a;
  border-radius: 16px;
  border: 1px solid #003366;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 221, 255, 0.1);
  color: #cfefff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #00ddff, #0099cc, #0066aa, #003388);
    background-size: 300% 100%;
    animation: gradientShift 3s ease infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: #00ddff;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-shadow: 0 0 20px rgba(0, 221, 255, 0.3);
`;

const Subtitle = styled.p`
  color: #99e6ff;
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #152238 0%, #1a2a45 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #003366;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 221, 255, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || '#00ddff'};
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.color || '#00ddff'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #99e6ff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 1rem;
  background: rgba(21, 34, 56, 0.8);
  border: 2px solid #003366;
  border-radius: 12px;
  color: #cfefff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow:
      0 0 0 3px rgba(0, 221, 255, 0.2),
      0 0 20px rgba(0, 221, 255, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #7aa3cc;
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
  background: rgba(21, 34, 56, 0.8);
  border: 2px solid #003366;
  border-radius: 12px;
  color: #cfefff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow:
      0 0 0 3px rgba(0, 221, 255, 0.2),
      0 0 20px rgba(0, 221, 255, 0.1);
  }

  option {
    background: #152238;
    color: #cfefff;
  }
`;

const ActionButton = styled.button`
  padding: 1rem 1.5rem;
  background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #00ddff 0%, #0099cc 100%)' : props.variant === 'danger' ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' : 'transparent'};
  color: ${props => props.variant === 'primary' || props.variant === 'danger' ? '#000' : '#00ddff'};
  border: 2px solid ${props => props.variant === 'danger' ? '#ff6b6b' : '#00ddff'};
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 221, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const UserCard = styled.div`
  background: linear-gradient(135deg, #152238 0%, #1a2a45 100%);
  border: 2px solid #003366;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 4px solid ${props => props.isAdmin ? '#00ddff' : '#666'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(0, 221, 255, 0.15);
    border-color: #00ddff;
  }

  ${props => props.isAdmin && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-left: 20px solid transparent;
      border-top: 20px solid #00ddff;
    }
    
    &::after {
      content: '⭐';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
    }
  `}
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ddff 0%, #0099cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(0, 221, 255, 0.3);
`;

const UserInfo = styled.div`
  margin-bottom: 1rem;
`;

const UserName = styled.h3`
  color: #cfefff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserEmail = styled.p`
  color: #99e6ff;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const UserMeta = styled.div`
  color: #7aa3cc;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => {
    switch(props.variant) {
      case 'admin': return props.isAdmin ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 221, 255, 0.1)';
      case 'view': return 'rgba(102, 187, 106, 0.1)';
      case 'delete': return 'rgba(255, 82, 82, 0.1)';
      default: return 'rgba(0, 221, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.variant) {
      case 'admin': return props.isAdmin ? '#ff6b6b' : '#00ddff';
      case 'view': return '#66bb6a';
      case 'delete': return '#ff5252';
      default: return '#00ddff';
    }
  }};
  border: 1px solid ${props => {
    switch(props.variant) {
      case 'admin': return props.isAdmin ? '#ff6b6b' : '#00ddff';
      case 'view': return '#66bb6a';
      case 'delete': return '#ff5252';
      default: return '#00ddff';
    }
  }};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: ${props => {
      switch(props.variant) {
        case 'admin': return props.isAdmin ? '#ff6b6b' : '#00ddff';
        case 'view': return '#66bb6a';
        case 'delete': return '#ff5252';
        default: return '#00ddff';
      }
    }};
    color: #000;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AddAdminForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  background: #152238;
  border: 1px solid #003366;
  border-radius: 4px;
  color: #cfefff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow: 0 0 0 2px rgba(0, 221, 255, 0.2);
  }
  
  &::placeholder {
    color: #99e6ff;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.danger ? '#ff4d4d' : '#00ddff'};
  color: ${props => props.danger ? '#fff' : '#000'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.danger ? '#d93636' : '#00b8cc'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AdminList = styled.div`
  display: grid;
  gap: 1rem;
`;

const AdminCard = styled.div`
  background: #152238;
  border: 1px solid #003366;
  border-radius: 6px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: #00ddff;
  }
`;

const AdminInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AdminName = styled.div`
  font-weight: 600;
  color: #cfefff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdminEmail = styled.div`
  color: #99e6ff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdminMeta = styled.div`
  color: #7aa3cc;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  background: ${props => props.error ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 221, 255, 0.1)'};
  border: 1px solid ${props => props.error ? 'rgba(255, 107, 107, 0.3)' : 'rgba(0, 221, 255, 0.3)'};
  color: ${props => props.error ? '#ff6b6b' : '#00ddff'};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #99e6ff;
`;

const AdminManagement = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    newUsersToday: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Hent alle brukere fra chats collection (alle som har sendt meldinger)
      const chatsRef = collection(db, 'chats');
      const chatsSnapshot = await getDocs(chatsRef);
      
      const userMap = new Map();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Samle alle unike brukere fra chats
      chatsSnapshot.forEach(doc => {
        const chatData = doc.data();
        if (chatData.user && chatData.user.email) {
          const userId = chatData.user.uid || chatData.user.email;
          if (!userMap.has(userId)) {
            const createdAt = chatData.timestamp?.toDate?.() || new Date(chatData.timestamp?.seconds * 1000) || new Date();
            userMap.set(userId, {
              id: userId,
              email: chatData.user.email,
              displayName: chatData.user.name || chatData.user.displayName || 'Unknown User',
              photoURL: chatData.user.photoURL || null,
              createdAt: createdAt,
              lastActivity: createdAt,
              isNewToday: createdAt >= today
            });
          } else {
            // Oppdater siste aktivitet
            const user = userMap.get(userId);
            const activityDate = chatData.timestamp?.toDate?.() || new Date(chatData.timestamp?.seconds * 1000) || new Date();
            if (activityDate > user.lastActivity) {
              user.lastActivity = activityDate;
            }
          }
        }
      });
      
      // Hent admin liste
      const adminsRef = collection(db, 'admins');
      const adminsSnapshot = await getDocs(adminsRef);
      const adminEmails = new Set();
      const adminsList = [];
      
      adminsSnapshot.forEach(doc => {
        const adminData = doc.data();
        adminEmails.add(adminData.email);
        adminsList.push({ id: doc.id, ...adminData });
      });
      
      // Merk brukere som admin
      const usersArray = Array.from(userMap.values()).map(user => ({
        ...user,
        isAdmin: adminEmails.has(user.email)
      }));
      
      // Beregn statistikk
      const newStats = {
        totalUsers: usersArray.length,
        totalAdmins: adminsList.length,
        newUsersToday: usersArray.filter(user => user.isNewToday).length,
        activeUsers: usersArray.filter(user => {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return user.lastActivity >= dayAgo;
        }).length
      };
      
      setUsers(usersArray);
      setAdmins(adminsList);
      setStats(newStats);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (user) => {
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      
      if (user.isAdmin) {
        // Fjern admin
        const adminDoc = admins.find(admin => admin.email === user.email);
        if (adminDoc) {
          await deleteDoc(doc(db, 'admins', adminDoc.id));
          setMessage(`Removed admin access for ${user.email}`);
        }
      } else {
        // Legg til admin
        await setDoc(doc(collection(db, 'admins')), {
          email: user.email,
          displayName: user.displayName,
          addedAt: serverTimestamp(),
          addedBy: auth.currentUser?.email || 'Unknown'
        });
        setMessage(`Added admin access for ${user.email}`);
      }
      
      await loadData(); // Reload data
    } catch (err) {
      setError(err.message || 'Failed to update admin status');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user) => {
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      
      // Fjern fra admins hvis brukeren er admin
      if (user.isAdmin) {
        const adminDoc = admins.find(admin => admin.email === user.email);
        if (adminDoc) {
          await deleteDoc(doc(db, 'admins', adminDoc.id));
        }
      }
      
      // Fjern alle chat-meldinger fra brukeren
      const chatsRef = collection(db, 'chats');
      const chatsSnapshot = await getDocs(chatsRef);
      
      const deletePromises = [];
      chatsSnapshot.forEach(chatDoc => {
        const chatData = chatDoc.data();
        if (chatData.user && chatData.user.email === user.email) {
          deletePromises.push(deleteDoc(doc(db, 'chats', chatDoc.id)));
        }
      });
      
      // Vent på at alle chat-meldinger blir slettet
      await Promise.all(deletePromises);
      
      setMessage(`Successfully deleted user ${user.email} and all their data from Firebase`);
      await loadData(); // Reload data
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'admins') return matchesSearch && user.isAdmin;
    if (filterType === 'users') return matchesSearch && !user.isAdmin;
    return matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('no-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#99e6ff' }}>
          <FiRefreshCw style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <div>Loading user management...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiUsers />
          User Management
        </Title>
        <Subtitle>
          Manage all users and admin permissions
        </Subtitle>
      </Header>

      {message && (
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(0, 221, 255, 0.1)', 
          border: '1px solid rgba(0, 221, 255, 0.3)', 
          borderRadius: '8px', 
          color: '#00ddff', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(255, 107, 107, 0.1)', 
          border: '1px solid rgba(255, 107, 107, 0.3)', 
          borderRadius: '8px', 
          color: '#ff6b6b', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <StatsGrid>
        <StatCard color="#00ddff">
          <StatNumber color="#00ddff">{stats.totalUsers}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard color="#ffa726">
          <StatNumber color="#ffa726">{stats.totalAdmins}</StatNumber>
          <StatLabel>Admins</StatLabel>
        </StatCard>
        <StatCard color="#66bb6a">
          <StatNumber color="#66bb6a">{stats.newUsersToday}</StatNumber>
          <StatLabel>New Today</StatLabel>
        </StatCard>
        <StatCard color="#ab47bc">
          <StatNumber color="#ab47bc">{stats.activeUsers}</StatNumber>
          <StatLabel>Active (24h)</StatLabel>
        </StatCard>
      </StatsGrid>

      <Controls>
        <SearchInput
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Users ({users.length})</option>
          <option value="admins">Admins Only ({users.filter(u => u.isAdmin).length})</option>
          <option value="users">Regular Users ({users.filter(u => !u.isAdmin).length})</option>
        </FilterSelect>

        <ActionButton variant="primary" onClick={loadData} disabled={loading}>
          <FiRefreshCw />
          Refresh
        </ActionButton>
      </Controls>

      <UserGrid>
        {filteredUsers.map((user) => (
          <UserCard key={user.id} isAdmin={user.isAdmin}>
            <UserAvatar>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(user.displayName)
              )}
            </UserAvatar>
            
            <UserInfo>
              <UserName>
                {user.isAdmin && <FiStar style={{ color: '#ffa726' }} />}
                {user.displayName}
              </UserName>
              <UserEmail>
                <FiMail />
                {user.email}
              </UserEmail>
              <UserMeta>
                <FiCalendar />
                Joined: {user.createdAt.toLocaleDateString('no-NO')}
              </UserMeta>
              <UserMeta>
                <FiCalendar />
                Last active: {user.lastActivity.toLocaleDateString('no-NO')}
              </UserMeta>
            </UserInfo>

            <UserActions>
              <ActionBtn
                variant="admin"
                isAdmin={user.isAdmin}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove admin access from' : 'grant admin access to'} ${user.email}?`)) {
                    toggleAdminStatus(user);
                  }
                }}
                disabled={actionLoading || user.email === auth.currentUser?.email}
              >
                {user.isAdmin ? <FiShieldOff /> : <FiShield />}
                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
              </ActionBtn>
              
              <ActionBtn variant="view">
                <FiEye />
                View Details
              </ActionBtn>

              <ActionBtn 
                variant="delete"
                onClick={() => {
                  const confirmMessage = `⚠️ DANGER: This will permanently delete ${user.email} and ALL their data from Firebase!\n\nThis includes:\n- All chat messages\n- Admin permissions\n- All user data\n\nThis action CANNOT be undone!\n\nType "DELETE" to confirm:`;
                  const confirmation = window.prompt(confirmMessage);
                  if (confirmation === 'DELETE') {
                    deleteUser(user);
                  } else if (confirmation !== null) {
                    alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
                  }
                }}
                disabled={actionLoading || user.email === auth.currentUser?.email}
              >
                <FiTrash2 />
                Delete User
              </ActionBtn>
            </UserActions>
          </UserCard>
        ))}
      </UserGrid>

      {filteredUsers.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#99e6ff',
          background: 'rgba(21, 34, 56, 0.3)',
          borderRadius: '12px',
          border: '1px solid #003366'
        }}>
          <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
          <div>No users found matching your search criteria</div>
        </div>
      )}
    </Container>
  );
};

export default AdminManagement;

