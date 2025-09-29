// React imports
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiX, FiSave, FiUser, FiCalendar, FiFlag, FiFileText,
  FiTag, FiClock, FiPlus, FiPercent, FiTrash2
} from 'react-icons/fi';

// Firebase imports
import {
  db, collection, doc, updateDoc, serverTimestamp
} from '../../firebase';

const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  cursor: default;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const FormContainer = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
  cursor: default;
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border-radius: 3px;
  }
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    transform: scale(1.1);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 16px;
    color: #60a5fa;
  }
`;

const Input = styled.input`
  padding: 12px 16px;
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
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
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
`;

const Select = styled.select`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
    background: rgba(255, 255, 255, 0.08);
  }
  
  option {
    background: #1e293b;
    color: #fff;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  padding: 4px 12px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
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

const TagInput = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  
  input {
    flex: 1;
  }
  
  button {
    padding: 12px 16px;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border: none;
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.primary {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border: none;
    color: #fff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(96, 165, 250, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
  }`;

const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  task = null, 
  admins = [] 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'backlog', // Changed from 'pending' to 'backlog' to match the system
    dueDate: '',
    progress: 0,
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        priority: task.priority || 'medium',
        status: task.status || 'backlog',
        dueDate: task.dueDate || '',
        progress: task.progress || 0,
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        status: 'backlog',
        dueDate: '',
        progress: 0,
        tags: []
      });
    }
  }, [task, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;

    try {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'Current User', // TODO: Get from auth context
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...(task.comments || []), comment];

      // Update task in Firebase
      if (db) {
        const taskRef = doc(db, 'tasks', task.id);
        await updateDoc(taskRef, {
          comments: updatedComments,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Comment added to Firebase');
      }

      setNewComment('');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT STARTED ===');
    console.log('Form data:', formData);
    console.log('Task being edited:', task);
    console.log('onSubmit function:', typeof onSubmit);

    if (!formData.title.trim()) {
      console.log('❌ Form validation failed: Title is empty');
      return;
    }

    setIsSubmitting(true);

    const taskData = {
      id: task?.id, // Include the task ID for updates
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      progress: formData.progress,
      tags: formData.tags
    };

    console.log('✅ Form validation passed, calling onSubmit with:', taskData);

    try {
      await onSubmit(taskData);
      console.log('✅ onSubmit completed successfully');
      onClose(); // Only close after successful update
    } catch (error) {
      console.error('❌ Error calling onSubmit:', error);
      // Keep form open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <FormOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <FormContainer>
        <FormHeader>
          <FormTitle>
            {task ? 'Rediger Oppgave' : 'Ny Oppgave'}
          </FormTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </FormHeader>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
          <FormGrid>
            <FormGroup className="full-width">
              <Label>
                <FiFileText />
                Tittel *
              </Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Skriv inn oppgavetittel..."
                required
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label>
                <FiFileText />
                Beskrivelse
              </Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beskriv oppgaven i detalj..."
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiUser />
                Tildel til
              </Label>
              <Select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              >
                <option value="">Velg admin...</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.name}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiFlag />
                Prioritet
              </Label>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="low">Lav</option>
                <option value="medium">Medium</option>
                <option value="high">Høy</option>
                <option value="urgent">Kritisk</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiClock />
                Status
              </Label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiCalendar />
                Frist
              </Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiPercent />
                Fremdrift ({formData.progress}%)
              </Label>
              <Input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${formData.progress}%, rgba(255,255,255,0.1) ${formData.progress}%, rgba(255,255,255,0.1) 100%)`,
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </FormGroup>

            <FormGroup className="full-width">
              <Label>
                <FiTag />
                Tags
              </Label>
              <TagInput>
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Legg til tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button type="button" onClick={handleAddTag}>
                  <FiPlus />
                </button>
              </TagInput>
              <TagsContainer>
                {formData.tags.map(tag => (
                  <Tag key={tag}>
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <FiX />
                    </button>
                  </Tag>
                ))}
              </TagsContainer>
            </FormGroup>
          </FormGrid>

          {/* Comments Section */}
          {task && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💬 Kommentarer ({task.comments?.length || 0})
              </h3>

              {/* Comment List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                {task.comments?.map(comment => (
                  <div key={comment.id} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa' }}>
                        {comment.author}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {new Date(comment.createdAt).toLocaleDateString('nb-NO')}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {comment.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Legg til en kommentar..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    padding: '12px 16px',
                    background: newComment.trim() ? 'linear-gradient(135deg, #60a5fa, #a78bfa)' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s'
                  }}
                >
                  📝 Legg til
                </button>
              </div>
            </div>
          )}

          <FormActions>
            {task && onDelete && (
              <Button
                type="button"
                className="danger"
                onClick={() => {
                  if (window.confirm('Er du sikker på at du vil slette denne oppgaven?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff'
                }}
              >
                <FiTrash2 />
                Slett Oppgave
              </Button>
            )}
            <Button type="button" className="secondary" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" className="primary" disabled={isSubmitting}>
              <FiSave />
              {isSubmitting ? 'Oppdaterer...' : (task ? 'Oppdater' : 'Opprett')} Oppgave
            </Button>
          </FormActions>
        </form>
      </FormContainer>
    </FormOverlay>
  );
};

export default TaskForm;
