import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getAllAdmins, 
  addAdminByEmail, 
  removeAdmin 
} from '../utils/firebaseAdmin';
import { auth } from '../firebase';
import { FiUserPlus, FiUserMinus, FiMail, FiCalendar, FiUser } from 'react-icons/fi';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #0a0f1a;
  border-radius: 8px;
  border: 1px solid #003366;
  box-shadow: 0 0 16px rgba(0,85,170,0.5);
  color: #cfefff;
`;

const Title = styled.h2`
  color: #00ddff;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px #000;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #99e6ff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const adminList = await getAllAdmins();
      setAdmins(adminList);
    } catch (err) {
      setError('Failed to load admins');
      console.error('Error loading admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      setActionLoading(true);
      setMessage('');
      setError('');

      const result = await addAdminByEmail(newAdminEmail.trim(), auth.currentUser);
      
      if (result.success) {
        setMessage(result.message);
        setNewAdminEmail('');
        await loadAdmins(); // Reload admin list
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (!window.confirm(`Are you sure you want to remove admin access for ${adminEmail}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage('');
      setError('');

      const result = await removeAdmin(adminId, auth.currentUser);
      
      if (result.success) {
        setMessage(result.message);
        await loadAdmins(); // Reload admin list
      }
    } catch (err) {
      setError(err.message || 'Failed to remove admin');
    } finally {
      setActionLoading(false);
    }
  };

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
        <LoadingSpinner>Loading admin management...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Admin Management</Title>
      
      {message && <Message>{message}</Message>}
      {error && <Message error>{error}</Message>}
      
      <Section>
        <SectionTitle>
          <FiUserPlus />
          Add New Admin
        </SectionTitle>
        <AddAdminForm onSubmit={handleAddAdmin}>
          <Input
            type="email"
            placeholder="Enter email address"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            disabled={actionLoading}
          />
          <Button type="submit" disabled={actionLoading || !newAdminEmail.trim()}>
            <FiUserPlus />
            {actionLoading ? 'Adding...' : 'Add Admin'}
          </Button>
        </AddAdminForm>
      </Section>

      <Section>
        <SectionTitle>
          <FiUser />
          Current Admins ({admins.length})
        </SectionTitle>
        
        {admins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#99e6ff' }}>
            No admins found
          </div>
        ) : (
          <AdminList>
            {admins.map((admin) => (
              <AdminCard key={admin.id}>
                <AdminInfo>
                  <AdminName>
                    <FiUser />
                    {admin.displayName || 'Unknown User'}
                  </AdminName>
                  <AdminEmail>
                    <FiMail />
                    {admin.email}
                  </AdminEmail>
                  <AdminMeta>
                    <FiCalendar />
                    Added: {formatDate(admin.addedAt)}
                  </AdminMeta>
                  {admin.lastLogin && (
                    <AdminMeta>
                      Last login: {formatDate(admin.lastLogin)}
                    </AdminMeta>
                  )}
                </AdminInfo>
                
                {admin.id !== auth.currentUser?.uid && (
                  <Button
                    danger
                    onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                    disabled={actionLoading}
                  >
                    <FiUserMinus />
                    Remove
                  </Button>
                )}
              </AdminCard>
            ))}
          </AdminList>
        )}
      </Section>
    </Container>
  );
};

export default AdminManagement;
