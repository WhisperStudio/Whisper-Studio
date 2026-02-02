import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '../../firebase';
import { auth } from '../../firebase';
import { 
  FiAlertTriangle, 
  FiEye, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiUser, 
  FiRefreshCw,
  FiZap,
  FiInfo,
  FiTag,
  FiCalendar,
  FiImage
} from 'react-icons/fi';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #0a0f1a;
  border-radius: 16px;
  border: 1px solid #003366;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  color: #cfefff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #003366;
`;

const Title = styled.h1`
  color: #00ddff;
  font-size: 2.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 0 20px rgba(0, 221, 255, 0.3);
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
  padding: 0.75rem 1rem;
  background: #152238;
  border: 1px solid #003366;
  border-radius: 8px;
  color: #cfefff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow: 0 0 0 2px rgba(0, 221, 255, 0.2);
  }

  &::placeholder {
    color: #7aa3cc;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: #152238;
  border: 1px solid #003366;
  border-radius: 8px;
  color: #cfefff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #00ddff;
  }

  option {
    background: #152238;
    color: #cfefff;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background: ${props => props.variant === 'primary' ? '#00ddff' : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#000' : '#00ddff'};
  border: 1px solid #00ddff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#00b8cc' : '#00ddff'};
    color: ${props => props.variant === 'primary' ? '#000' : '#000'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BugList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BugCard = styled.div`
  background: linear-gradient(135deg, #152238 0%, #1a2a45 100%);
  border: 1px solid #003366;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  border-left: 4px solid ${props => {
    switch(props.priority) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa726';
      case 'medium': return '#ffeb3b';
      case 'low': return '#66bb6a';
      default: return '#00ddff';
    }
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    border-color: #00ddff;
  }
`;

const BugHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const BugTitle = styled.h3`
  color: #cfefff;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  cursor: pointer;
  
  &:hover {
    color: #00ddff;
  }
`;

const BugMeta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #99e6ff;
  font-size: 0.9rem;
`;

const PriorityBadge = styled.span`
  background: ${props => {
    switch(props.priority) {
      case 'critical': return 'rgba(255, 107, 107, 0.2)';
      case 'high': return 'rgba(255, 167, 38, 0.2)';
      case 'medium': return 'rgba(255, 235, 59, 0.2)';
      case 'low': return 'rgba(102, 187, 106, 0.2)';
      default: return 'rgba(0, 221, 255, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.priority) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa726';
      case 'medium': return '#ffeb3b';
      case 'low': return '#66bb6a';
      default: return '#00ddff';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch(props.status) {
      case 'open': return 'rgba(255, 107, 107, 0.2)';
      case 'in-progress': return 'rgba(255, 167, 38, 0.2)';
      case 'resolved': return 'rgba(102, 187, 106, 0.2)';
      case 'closed': return 'rgba(158, 158, 158, 0.2)';
      default: return 'rgba(0, 221, 255, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'open': return '#ff6b6b';
      case 'in-progress': return '#ffa726';
      case 'resolved': return '#66bb6a';
      case 'closed': return '#9e9e9e';
      default: return '#00ddff';
    }
  }};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const BugDescription = styled.p`
  color: #99e6ff;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BugActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => {
    switch(props.variant) {
      case 'view': return 'rgba(0, 221, 255, 0.1)';
      case 'edit': return 'rgba(255, 167, 38, 0.1)';
      case 'resolve': return 'rgba(102, 187, 106, 0.1)';
      case 'delete': return 'rgba(255, 107, 107, 0.1)';
      default: return 'rgba(0, 221, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.variant) {
      case 'view': return '#00ddff';
      case 'edit': return '#ffa726';
      case 'resolve': return '#66bb6a';
      case 'delete': return '#ff6b6b';
      default: return '#00ddff';
    }
  }};
  border: 1px solid ${props => {
    switch(props.variant) {
      case 'view': return '#00ddff';
      case 'edit': return '#ffa726';
      case 'resolve': return '#66bb6a';
      case 'delete': return '#ff6b6b';
      default: return '#00ddff';
    }
  }};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      switch(props.variant) {
        case 'view': return '#00ddff';
        case 'edit': return '#ffa726';
        case 'resolve': return '#66bb6a';
        case 'delete': return '#ff6b6b';
        default: return '#00ddff';
      }
    }};
    color: #000;
    transform: translateY(-1px);
  }
`;

const ImageGallery = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ThumbnailImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #003366;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    border-color: #00ddff;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: #152238;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #003366;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #99e6ff;
  cursor: pointer;
  font-size: 1.5rem;
  
  &:hover {
    color: #ff6b6b;
  }
`;

const BugDashboard = () => {
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedBug, setSelectedBug] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0
  });

  useEffect(() => {
    loadBugs();
  }, []);

  useEffect(() => {
    filterBugs();
  }, [bugs, searchTerm, statusFilter, priorityFilter]);

  const loadBugs = async () => {
    try {
      setLoading(true);
      const bugsRef = collection(db, 'bugs');
      const q = query(bugsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const bugsData = [];
      snapshot.forEach(doc => {
        bugsData.push({ id: doc.id, ...doc.data() });
      });
      
      setBugs(bugsData);
      calculateStats(bugsData);
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bugsData) => {
    const stats = {
      total: bugsData.length,
      open: bugsData.filter(bug => bug.status === 'open').length,
      inProgress: bugsData.filter(bug => bug.status === 'in-progress').length,
      resolved: bugsData.filter(bug => bug.status === 'resolved').length,
      critical: bugsData.filter(bug => bug.priority === 'critical').length,
      high: bugsData.filter(bug => bug.priority === 'high').length
    };
    setStats(stats);
  };

  const filterBugs = () => {
    let filtered = bugs;

    if (searchTerm) {
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.reporterName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bug => bug.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(bug => bug.priority === priorityFilter);
    }

    setFilteredBugs(filtered);
  };

  const updateBugStatus = async (bugId, newStatus) => {
    try {
      const bugRef = doc(db, 'bugs', bugId);
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'resolved') {
        updateData.resolved = true;
        updateData.resolvedAt = serverTimestamp();
        updateData.resolvedBy = auth.currentUser?.uid;
      }

      await updateDoc(bugRef, updateData);
      
      // Update local state
      setBugs(prev => prev.map(bug => 
        bug.id === bugId 
          ? { ...bug, ...updateData, updatedAt: new Date() }
          : bug
      ));
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const deleteBug = async (bugId) => {
    if (!window.confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    try {
      await deleteDoc(doc(db, 'bugs', bugId));
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
    } catch (error) {
      console.error('Error deleting bug:', error);
    }
  };

  const viewBugDetails = (bug) => {
    setSelectedBug(bug);
    setShowModal(true);
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return <FiZap />;
      case 'high': return <FiAlertTriangle />;
      case 'medium': return <FiInfo />;
      case 'low': return <FiInfo />;
      default: return <FiInfo />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Ukjent';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>
          <FiAlertTriangle />
          Bug Dashboard
        </Title>
        <ActionButton variant="primary" onClick={loadBugs} disabled={loading}>
          <FiRefreshCw />
          Oppdater
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard color="#00ddff">
          <StatNumber color="#00ddff">{stats.total}</StatNumber>
          <StatLabel>Totalt</StatLabel>
        </StatCard>
        <StatCard color="#ff6b6b">
          <StatNumber color="#ff6b6b">{stats.open}</StatNumber>
          <StatLabel>Åpne</StatLabel>
        </StatCard>
        <StatCard color="#ffa726">
          <StatNumber color="#ffa726">{stats.inProgress}</StatNumber>
          <StatLabel>Under arbeid</StatLabel>
        </StatCard>
        <StatCard color="#66bb6a">
          <StatNumber color="#66bb6a">{stats.resolved}</StatNumber>
          <StatLabel>Løst</StatLabel>
        </StatCard>
        <StatCard color="#ff6b6b">
          <StatNumber color="#ff6b6b">{stats.critical}</StatNumber>
          <StatLabel>Kritiske</StatLabel>
        </StatCard>
        <StatCard color="#ffa726">
          <StatNumber color="#ffa726">{stats.high}</StatNumber>
          <StatLabel>Høy prioritet</StatLabel>
        </StatCard>
      </StatsGrid>

      <Controls>
        <SearchInput
          type="text"
          placeholder="Søk i rapporter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Alle statuser</option>
          <option value="open">Åpne</option>
          <option value="in-progress">Under arbeid</option>
          <option value="resolved">Løst</option>
          <option value="closed">Lukket</option>
        </FilterSelect>

        <FilterSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">Alle prioriteter</option>
          <option value="critical">Kritisk</option>
          <option value="high">Høy</option>
          <option value="medium">Medium</option>
          <option value="low">Lav</option>
        </FilterSelect>
      </Controls>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#99e6ff' }}>
          Laster rapporter...
        </div>
      ) : (
        <BugList>
          {filteredBugs.map(bug => (
            <BugCard key={bug.id} priority={bug.priority}>
              <BugHeader>
                <div style={{ flex: 1 }}>
                  <BugTitle onClick={() => viewBugDetails(bug)}>
                    {bug.title}
                  </BugTitle>
                  <BugMeta>
                    <MetaItem>
                      {getPriorityIcon(bug.priority)}
                      <PriorityBadge priority={bug.priority}>
                        {bug.priority}
                      </PriorityBadge>
                    </MetaItem>
                    <MetaItem>
                      <FiTag />
                      <StatusBadge status={bug.status}>
                        {bug.status}
                      </StatusBadge>
                    </MetaItem>
                    <MetaItem>
                      <FiUser />
                      {bug.reporterName || 'Anonym'}
                    </MetaItem>
                    <MetaItem>
                      <FiCalendar />
                      {formatDate(bug.createdAt)}
                    </MetaItem>
                    {bug.images && bug.images.length > 0 && (
                      <MetaItem>
                        <FiImage />
                        {bug.images.length} bilder
                      </MetaItem>
                    )}
                  </BugMeta>
                </div>
              </BugHeader>

              <BugDescription>{bug.description}</BugDescription>

              {bug.images && bug.images.length > 0 && (
                <ImageGallery>
                  {bug.images.slice(0, 3).map((image, index) => (
                    <ThumbnailImage
                      key={index}
                      src={image}
                      alt={`Bug ${index + 1}`}
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                  {bug.images.length > 3 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: '#99e6ff', 
                      fontSize: '0.9rem' 
                    }}>
                      +{bug.images.length - 3} flere
                    </div>
                  )}
                </ImageGallery>
              )}

              <BugActions>
                <ActionBtn variant="view" onClick={() => viewBugDetails(bug)}>
                  <FiEye />
                  Se detaljer
                </ActionBtn>
                {bug.status !== 'resolved' && (
                  <ActionBtn 
                    variant="resolve" 
                    onClick={() => updateBugStatus(bug.id, 'resolved')}
                  >
                    <FiCheck />
                    Merk som løst
                  </ActionBtn>
                )}
                {bug.status === 'open' && (
                  <ActionBtn 
                    variant="edit" 
                    onClick={() => updateBugStatus(bug.id, 'in-progress')}
                  >
                    <FiClock />
                    Start arbeid
                  </ActionBtn>
                )}
                <ActionBtn variant="delete" onClick={() => deleteBug(bug.id)}>
                  <FiTrash2 />
                  Slett
                </ActionBtn>
              </BugActions>
            </BugCard>
          ))}
        </BugList>
      )}

      <Modal show={showModal}>
        <ModalContent>
          <CloseButton onClick={() => setShowModal(false)}>
            <FiX />
          </CloseButton>
          
          {selectedBug && (
            <div>
              <h2 style={{ color: '#00ddff', marginBottom: '1rem' }}>
                {selectedBug.title}
              </h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <BugMeta>
                  <MetaItem>
                    {getPriorityIcon(selectedBug.priority)}
                    <PriorityBadge priority={selectedBug.priority}>
                      {selectedBug.priority}
                    </PriorityBadge>
                  </MetaItem>
                  <MetaItem>
                    <FiTag />
                    <StatusBadge status={selectedBug.status}>
                      {selectedBug.status}
                    </StatusBadge>
                  </MetaItem>
                  <MetaItem>
                    <FiUser />
                    {selectedBug.reporterName || 'Anonym'}
                  </MetaItem>
                  <MetaItem>
                    <FiCalendar />
                    {formatDate(selectedBug.createdAt)}
                  </MetaItem>
                </BugMeta>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Beskrivelse:</h4>
                <p style={{ color: '#99e6ff', lineHeight: 1.6 }}>
                  {selectedBug.description}
                </p>
              </div>

              {selectedBug.steps && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Steg for å reprodusere:</h4>
                  <p style={{ color: '#99e6ff', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedBug.steps}
                  </p>
                </div>
              )}

              {selectedBug.expected && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Forventet resultat:</h4>
                  <p style={{ color: '#99e6ff', lineHeight: 1.6 }}>
                    {selectedBug.expected}
                  </p>
                </div>
              )}

              {selectedBug.actual && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Faktisk resultat:</h4>
                  <p style={{ color: '#99e6ff', lineHeight: 1.6 }}>
                    {selectedBug.actual}
                  </p>
                </div>
              )}

              {selectedBug.browser && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Nettleser/Enhet:</h4>
                  <p style={{ color: '#99e6ff' }}>
                    {selectedBug.browser}
                  </p>
                </div>
              )}

              {selectedBug.images && selectedBug.images.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#00ddff', marginBottom: '0.5rem' }}>Bilder:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {selectedBug.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Bug ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalContent>
      </Modal>
    </DashboardContainer>
  );
};

export default BugDashboard;
