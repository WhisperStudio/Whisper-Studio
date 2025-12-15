import React from 'react';
import styled from 'styled-components';
import { FiSearch, FiUsers, FiFlag, FiLayers, FiList } from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';

const FilterContainer = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 20px 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  @media (max-width: 1200px) {
    flex-wrap: wrap;
    gap: 20px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 1200px) {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: #0d1117;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #30363d;
  color: #c9d1d9;
  transition: all 0.2s;
  min-width: 150px;

  &:focus-within {
    border-color: #58a6ff;
    box-shadow: 0 0 0 1px #58a6ff;
  }
  
  svg {
    color: #8b949e;
    margin-right: 8px;
  }

  input, select {
    background: none;
    border: none;
    color: #c9d1d9;
    font-size: 15px;
    padding: 0;
    
    &:focus {
      outline: none;
    }
  }

  select {
    cursor: pointer;
    appearance: none;
    min-width: 100%;
    
    option {
        background: #0d1117;
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #0d1117;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  border: 1px solid #30363d;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.active ? '#58a6ff' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${props => props.active ? '#0d1117' : '#8b949e'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#58a6ff' : '#161b22'};
    color: ${props => props.active ? '#0d1117' : '#c9d1d9'};
  }
`;

const TaskFilters = ({ filters, onFiltersChange, admins, viewMode, onViewModeChange, taskCount }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFiltersChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <FilterContainer>
      <FilterGroup>
        <InputGroup style={{ minWidth: '250px' }}>
          <FiSearch />
          <input
            type="text"
            name="search"
            placeholder="Søk tittel/beskrivelse..."
            value={filters.search}
            onChange={handleChange}
          />
        </InputGroup>

        <InputGroup>
          <FiUsers />
          <select name="assignedTo" value={filters.assignedTo} onChange={handleChange}>
            <option value="">Alle ansatte</option>
            <option value="unassigned">Ikke tildelt</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.name}>{admin.name}</option>
            ))}
          </select>
        </InputGroup>

        <InputGroup>
          <FiFlag />
          <select name="priority" value={filters.priority} onChange={handleChange}>
            <option value="">Alle prioriteter</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </InputGroup>
        
        {viewMode !== 'kanban' && (
            <InputGroup>
              <FiLayers />
              <select name="status" value={filters.status} onChange={handleChange}>
                <option value="">Alle statuser</option>
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </InputGroup>
        )}
      </FilterGroup>

      <ViewToggle>
        <ViewButton 
          active={viewMode === 'kanban'} 
          onClick={() => onViewModeChange('kanban')}
        >
          <BsKanban /> Kanban
        </ViewButton>
        <ViewButton 
          active={viewMode === 'list'} 
          onClick={() => onViewModeChange('list')}
        >
          <FiList /> Liste ({taskCount})
        </ViewButton>
      </ViewToggle>
    </FilterContainer>
  );
};

export default TaskFilters;