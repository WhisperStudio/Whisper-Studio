import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSave, FiTrash2, FiLayers, FiEdit3, FiPlus } from 'react-icons/fi';
import TaskCard from './TaskCard'; 

// =======================================================
// STYLED COMPONENTS (TaskForm V4.0)
// =======================================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000; /* Ekstremt høy z-index */
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FormContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: min(95%, 900px); /* Enda bredere */
  height: 100%;
  background: #0d1117;
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.9);
  z-index: 10001;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  padding: 25px 35px;
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #58a6ff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 0 5px rgba(88, 166, 255, 0.3);
`;

const CloseButton = styled.button`
  background: #30363d;
  border: 1px solid #444c56;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #f85149;
    border-color: #f85149;
    transform: rotate(90deg);
  }
`;

const FormContent = styled.div`
  flex: 1;
  padding: 35px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: minmax(350px, 1fr) 400px; 
  gap: 40px;
  
  @media (max-width: 950px) {
    grid-template-columns: 1fr;
    padding: 25px;
  }
`;

const FormSection = styled.form`
  padding-right: 20px;
  
  @media (max-width: 950px) {
    padding-right: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #238636;
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: #161b22;
  border: 1px solid #444c56;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 16px;
  transition: all 0.3s;

  &:focus {
    border-color: #58a6ff;
    box-shadow: 0 0 0 1px #58a6ff;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  background: #161b22;
  border: 1px solid #444c56;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    border-color: #58a6ff;
    box-shadow: 0 0 0 1px #58a6ff;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  background: #161b22;
  border: 1px solid #444c56;
  border-radius: 8px;
  color: #c9d1d9;
  font-size: 16px;
  cursor: pointer;
  appearance: none; 
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%2358A6FF' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.8rem auto;

  option {
    background: #0d1117;
    color: #c9d1d9;
  }

  &:focus {
    border-color: #58a6ff;
    box-shadow: 0 0 0 1px #58a6ff;
    outline: none;
  }
`;

const FormFooter = styled.div`
  padding: 25px 35px;
  border-top: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
`;

const SaveButton = styled.button`
  padding: 14px 28px;
  background: #238636;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-weight: 800;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  
  &:hover {
    background: #2ea043;
    box-shadow: 0 5px 15px rgba(46, 160, 67, 0.5);
    transform: translateY(-2px);
  }
`;

const DeleteButton = styled.button`
  padding: 14px 28px;
  background: #30363d;
  border: 1px solid #f85149;
  border-radius: 14px;
  color: #f85149;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    background: #f85149;
    color: #fff;
    box-shadow: 0 4px 10px rgba(248, 81, 73, 0.3);
  }
`;

const PreviewCardWrapper = styled.div`
  padding: 20px;
  margin-top: 10px;
  position: sticky;
  top: 10px;
  
  h3 {
    color: #58a6ff;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
    text-shadow: 0 0 2px rgba(88, 166, 255, 0.3);
  }
`;

const statusOptions = ['backlog', 'todo', 'in-progress', 'review', 'completed'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

// =======================================================
// HOVEDKOMPONENT LOGIKK (TaskForm)
// =======================================================

const TaskForm = ({ isOpen, onClose, onSubmit, onDelete, task, admins }) => {
  const defaultTask = {
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    progress: 0,
    tags: []
  };
  
  const [formData, setFormData] = useState(defaultTask);
  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      const formattedDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
      setFormData({ 
          ...task,
          dueDate: formattedDueDate,
          tags: Array.isArray(task.tags) ? task.tags.join(', ') : task.tags || ''
      });
    } else {
      setFormData(defaultTask);
    }
  }, [task, isOpen, defaultTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, progress: isNaN(value) ? 0 : Math.min(100, Math.max(0, value)) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
      
    const dataToSubmit = {
        ...formData,
        tags: tagsArray,
        progress: formData.progress 
    };
    
    try {
        await onSubmit(dataToSubmit);
        onClose();
    } catch (error) {
        alert(`Klarte ikke å ${isEditing ? 'oppdatere' : 'opprette'} oppgave.`);
    }
  };

  const handleDelete = () => {
      if (isEditing) {
          onDelete(task.id);
          onClose();
      }
  };

  // Lager en oppgave for live TaskCard preview
  const previewTask = {
      ...formData,
      tags: Array.isArray(formData.tags) 
          ? formData.tags 
          : formData.tags.split(',').map(tag => tag.trim()).filter(t => t),
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : '', 
      createdAt: task?.createdAt || new Date().toISOString(),
      comments: task?.comments || []
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen}>
      <FormContainer isOpen={isOpen}>
        <FormHeader>
          <FormTitle>
            {isEditing ? <FiEdit3 size={24} /> : <FiPlus size={24} />}
            {isEditing ? 'Rediger Oppgave' : 'Ny Oppgave'}
          </FormTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </FormHeader>

        <FormContent>
          {/* Skjema Kolonne */}
          <FormSection onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Tittel</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Beskrivelse</Label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{gridColumn: 'span 2'}}>
                    <Label htmlFor="assignedTo">Tildelt til</Label>
                    <Select name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
                        <option value="">Ikke tildelt</option>
                        {admins.map(admin => (
                        <option key={admin.id} value={admin.name}>{admin.name}</option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Label htmlFor="priority">Prioritet</Label>
                    <Select name="priority" value={formData.priority} onChange={handleChange} required>
                        {priorityOptions.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </Select>
                </div>
                
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={formData.status} onChange={handleChange} required disabled={isEditing && formData.status === 'completed'}>
                        {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </Select>
                </div>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="dueDate">Frist</Label>
              <Input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="progress">Fremdrift ({formData.progress}%)</Label>
              <Input
                type="range"
                id="progress"
                name="progress"
                min="0"
                max="100"
                step="1"
                value={formData.progress}
                onChange={handleProgressChange}
                style={{padding: '0', background: 'transparent'}}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="tags">Tags (komma-separert)</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                placeholder="f.eks. ui, design, backend"
                value={formData.tags}
                onChange={handleChange}
              />
            </FormGroup>
          </FormSection>
          
          {/* Forhåndsvisning Kolonne */}
          <PreviewCardWrapper>
            <h3><FiLayers size={18} /> Kort Forhåndsvisning</h3>
            <TaskCard 
              task={previewTask} 
              onEdit={() => {}} 
              onDelete={() => {}} 
              onTaskUpdate={() => {}} 
              isDragging={false} 
            />
          </PreviewCardWrapper>

        </FormContent>
        
        <FormFooter>
          {isEditing && (
            <DeleteButton onClick={handleDelete} type="button">
              <FiTrash2 /> Slett Oppgave
            </DeleteButton>
          )}
          <div style={{marginLeft: isEditing ? 'auto' : '0'}}>
             <SaveButton onClick={handleSubmit} type="submit">
               <FiSave /> {isEditing ? 'Lagre Endringer' : 'Opprett Oppgave'}
             </SaveButton>
          </div>
        </FormFooter>
      </FormContainer>
    </ModalOverlay>
  );
};

export default TaskForm;