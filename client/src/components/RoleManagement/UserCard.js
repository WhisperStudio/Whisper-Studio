import  { useState } from 'react';
import styled from 'styled-components';
import { 
  FiMail, FiCalendar, FiTrash2, FiEdit3,
  FiLock,  FiSettings,  FiAward, FiAlertTriangle
} from 'react-icons/fi';
import { BsAward, BsShieldCheck, BsPerson, BsPersonBadge } from 'react-icons/bs';

// Styled Components
const Card = styled.div`
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch(props.role) {
        case 'owner': return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
        case 'admin': return 'linear-gradient(90deg, #60a5fa, #3b82f6)';
        case 'support': return 'linear-gradient(90deg, #a78bfa, #8b5cf6)';
        default: return 'linear-gradient(90deg, #6b7280, #4b5563)';
      }
    }};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #60a5fa, #a78bfa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  border: 3px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 12px;
  }
`;

const RoleBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  background: ${props => {
    switch(props.role) {
      case 'owner': return 'rgba(251, 191, 36, 0.2)';
      case 'admin': return 'rgba(96, 165, 250, 0.2)';
      case 'support': return 'rgba(167, 139, 250, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.role) {
      case 'owner': return '#fbbf24';
      case 'admin': return '#60a5fa';
      case 'support': return '#a78bfa';
      default: return '#6b7280';
    }
  }};
  border: 1px solid ${props => {
    switch(props.role) {
      case 'owner': return 'rgba(251, 191, 36, 0.3)';
      case 'admin': return 'rgba(96, 165, 250, 0.3)';
      case 'support': return 'rgba(167, 139, 250, 0.3)';
      default: return 'rgba(107, 114, 128, 0.3)';
    }
  }};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaItem = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 14px;
    color: #60a5fa;
  }
`;

const PermissionsList = styled.div`
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PermissionTag = styled.span`
  padding: 4px 8px;
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: ${props => {
    if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
    if (props.variant === 'primary') return 'rgba(96, 165, 250, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.3)';
    if (props.variant === 'primary') return 'rgba(96, 165, 250, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.variant === 'danger') return '#ef4444';
    if (props.variant === 'primary') return '#60a5fa';
    return 'rgba(255, 255, 255, 0.8)';
  }};
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${props => {
      if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
      if (props.variant === 'primary') return 'rgba(96, 165, 250, 0.2)';
      return 'rgba(255, 255, 255, 0.1)';
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RoleSelect = styled.select`
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
  }
  
  option {
    background: #1e293b;
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Helper functions
const getRoleIcon = (role) => {
  switch(role) {
    case 'owner': return <BsAward />;
    case 'admin': return <BsShieldCheck />;
    case 'support': return <BsPersonBadge />;
    case 'pending': return <FiAlertTriangle />;
    default: return <BsPerson />;
  }
};

const getRoleLabel = (role) => {
  switch(role) {
    case 'owner': return 'Eier';
    case 'admin': return 'Administrator';
    case 'support': return 'Support';
    case 'pending': return 'Venter godkjenning';
    default: return 'Bruker';
  }
};

const getAvatarColor = (name) => {
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

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Main Component
const UserCard = ({ 
  user, 
  currentUserRole, 
  canManage, 
  onUpdateRole, 
  onUpdatePermissions, 
  onDelete 
}) => {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');

  const handleRoleChange = () => {
    if (selectedRole !== user.role) {
      onUpdateRole(user.id, selectedRole);
    }
    setIsEditingRole(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Ukjent';
    return new Date(date).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card role={user.role}>
      <RoleBadge role={user.role}>
        {getRoleIcon(user.role)}
        {getRoleLabel(user.role)}
      </RoleBadge>

      <CardHeader>
        <Avatar color={getAvatarColor(user.email)}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = getInitials(user.displayName || user.email);
              }}
            />
          ) : (
            getInitials(user.displayName || user.email)
          )}
        </Avatar>
        <UserInfo>
          <UserName>
            {user.displayName || 'Ingen navn'}
            {user.role === 'owner' && <FiAward style={{ color: '#fbbf24' }} />}
          </UserName>
          <UserEmail>
            <FiMail />
            {user.email}
          </UserEmail>
        </UserInfo>
      </CardHeader>

      <MetaInfo>
        <MetaItem>
          <FiCalendar />
          Opprettet: {formatDate(user.createdAt)}
        </MetaItem>
        <MetaItem>
          <FiCalendar />
          Sist aktiv: {formatDate(user.lastActivity)}
        </MetaItem>
      </MetaInfo>

      {user.permissions && user.permissions.length > 0 && (
        <PermissionsList>
          {user.permissions.map(perm => (
            <PermissionTag key={perm}>{perm}</PermissionTag>
          ))}
        </PermissionsList>
      )}

      <Actions>
        {canManage && (
          <>
            {isEditingRole ? (
              <>
                <RoleSelect 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={user.role === 'owner'}
                >
                  <option value="user">Bruker</option>
                  <option value="support">Support</option>
                  <option value="admin">Administrator</option>
                  {currentUserRole === 'owner' && (
                    <option value="owner">Eier</option>
                  )}
                </RoleSelect>
                <ActionButton 
                  variant="primary" 
                  onClick={handleRoleChange}
                  disabled={user.role === 'owner' && currentUserRole !== 'owner'}
                >
                  Lagre
                </ActionButton>
                <ActionButton onClick={() => setIsEditingRole(false)}>
                  Avbryt
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton 
                  onClick={() => setIsEditingRole(true)}
                  disabled={user.role === 'owner' && currentUserRole !== 'owner'}
                >
                  <FiEdit3 /> Rolle
                </ActionButton>
                <ActionButton 
                  variant="primary" 
                  onClick={onUpdatePermissions}
                  disabled={user.role === 'owner' && currentUserRole !== 'owner'}
                >
                  <FiSettings /> Tillatelser
                </ActionButton>
                <ActionButton 
                  variant="danger" 
                  onClick={onDelete}
                  disabled={user.role === 'owner' || user.email === 'vintra@whisper.no'}
                >
                  <FiTrash2 /> Slett
                </ActionButton>
              </>
            )}
          </>
        )}
        
        {!canManage && (
          <ActionButton disabled>
            <FiLock /> Ingen tilgang
          </ActionButton>
        )}
      </Actions>
    </Card>
  );
};

export default UserCard;
