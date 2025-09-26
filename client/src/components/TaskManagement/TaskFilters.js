import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiFilter, FiSearch, FiUser, FiFlag, FiClock, FiX,
  FiChevronDown, FiGrid, FiList
} from 'react-icons/fi';

// Styled Components
const FiltersContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 5;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FiltersTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #60a5fa;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.active ? 'rgba(96, 165, 250, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#60a5fa' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  
  &:hover {
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1.2fr 1fr 1fr auto;
    gap: 14px;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 14px;
    color: #60a5fa;
  }
`;

const SearchInput = styled.div`
  position: relative;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
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
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
  position: relative;
  z-index: 10;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
    background-color: rgba(255, 255, 255, 0.08);
    z-index: 20;
  }
  
  option {
    background: #1e293b;
    color: #fff;
    padding: 8px 12px;
  }
`;

const ClearButton = styled.button`
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.05);
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActiveFilter = styled.span`
  padding: 6px 12px;
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    
    &:hover {
      color: #ef4444;
    }
  }
`;

const ResultsCount = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
  
  strong {
    color: #60a5fa;
    font-weight: 600;
  }
`;

// Main Component
const TaskFilters = ({
  filters,
  onFiltersChange,
  admins = [],
  taskCount = 0,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      assignedTo: '',
      priority: '',
      status: '',
      sortBy: 'createdAt'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '' && value !== 'createdAt'
    ).length;
  };

  const getActiveFilters = () => {
    const active = [];
    
    if (filters.search) {
      active.push({ key: 'search', label: `Søk: "${filters.search}"`, value: filters.search });
    }
    if (filters.assignedTo) {
      active.push({ key: 'assignedTo', label: `Tildelt: ${filters.assignedTo}`, value: filters.assignedTo });
    }
    if (filters.priority) {
      active.push({ key: 'priority', label: `Prioritet: ${filters.priority}`, value: filters.priority });
    }
    if (filters.status) {
      active.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
    }
    
    return active;
  };

  return (
    <FiltersContainer>
      <FiltersHeader>
        <FiltersTitle>
          <FiFilter />
          Filtrer Oppgaver
          {getActiveFiltersCount() > 0 && (
            <span style={{ 
              background: 'rgba(96, 165, 250, 0.2)', 
              color: '#60a5fa', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {getActiveFiltersCount()}
            </span>
          )}
        </FiltersTitle>
        
        <ViewToggle>
          <ViewButton 
            active={viewMode === 'grid'} 
            onClick={() => onViewModeChange('grid')}
          >
            <FiGrid />
            Rutenett
          </ViewButton>
          <ViewButton 
            active={viewMode === 'list'} 
            onClick={() => onViewModeChange('list')}
          >
            <FiList />
            Liste
          </ViewButton>
        </ViewToggle>
      </FiltersHeader>

      <FiltersGrid>
        <FilterGroup>
          <FilterLabel>
            <FiSearch />
            Søk
          </FilterLabel>
          <SearchInput>
            <FiSearch />
            <input
              type="text"
              placeholder="Søk i tittel eller beskrivelse..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </SearchInput>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>
            <FiUser />
            Tildelt til
          </FilterLabel>
          <FilterSelect
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          >
            <option value="">Alle admins</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.name}>
                {admin.name}
              </option>
            ))}
            <option value="unassigned">Ikke tildelt</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>
            <FiFlag />
            Prioritet
          </FilterLabel>
          <FilterSelect
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Alle prioriteter</option>
            <option value="urgent">Kritisk</option>
            <option value="high">Høy</option>
            <option value="medium">Medium</option>
            <option value="low">Lav</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>
            <FiClock />
            Status
          </FilterLabel>
          <FilterSelect
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Alle statuser</option>
            <option value="pending">Venter</option>
            <option value="in-progress">Pågår</option>
            <option value="completed">Fullført</option>
          </FilterSelect>
        </FilterGroup>

        {getActiveFiltersCount() > 0 && (
          <ClearButton onClick={clearAllFilters}>
            <FiX />
            Nullstill
          </ClearButton>
        )}
      </FiltersGrid>

      {getActiveFilters().length > 0 && (
        <ActiveFilters>
          {getActiveFilters().map(filter => (
            <ActiveFilter key={filter.key}>
              {filter.label}
              <button onClick={() => handleFilterChange(filter.key, '')}>
                <FiX />
              </button>
            </ActiveFilter>
          ))}
        </ActiveFilters>
      )}

      <ResultsCount>
        Viser <strong>{taskCount}</strong> oppgave{taskCount !== 1 ? 'r' : ''}
        {getActiveFiltersCount() > 0 && ' (filtrert)'}
      </ResultsCount>
    </FiltersContainer>
  );
};

export default TaskFilters;
