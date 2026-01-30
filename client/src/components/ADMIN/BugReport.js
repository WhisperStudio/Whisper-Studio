import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { 
  db, 
  collection, 
  addDoc, 
  serverTimestamp,
  storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '../../firebase';
import { auth } from '../../firebase';
import { 
  FiAlertTriangle, 
  FiUpload, 
  FiX, 
  FiSend, 
  FiInfo, 
  FiZap,
  FiImage,
  FiUser,
  FiCalendar,
  FiTag
} from 'react-icons/fi';

const BugContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0f1a 0%, #152238 100%);
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
    background: linear-gradient(90deg, #ff6b6b, #ffa726, #66bb6a, #42a5f5, #ab47bc);
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
  margin-bottom: 2rem;
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

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #00ddff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
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

const TextArea = styled.textarea`
  padding: 1rem;
  background: rgba(21, 34, 56, 0.8);
  border: 2px solid #003366;
  border-radius: 12px;
  color: #cfefff;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: inherit;

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

const Select = styled.select`
  padding: 1rem;
  background: rgba(21, 34, 56, 0.8);
  border: 2px solid #003366;
  border-radius: 12px;
  color: #cfefff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #00ddff;
    box-shadow: 
      0 0 0 3px rgba(0, 221, 255, 0.2),
      0 0 20px rgba(0, 221, 255, 0.1);
    transform: translateY(-2px);
  }

  option {
    background: #152238;
    color: #cfefff;
  }
`;

const PrioritySelect = styled(Select)`
  background: ${props => {
    switch(props.value) {
      case 'critical': return 'rgba(255, 107, 107, 0.2)';
      case 'high': return 'rgba(255, 167, 38, 0.2)';
      case 'medium': return 'rgba(255, 235, 59, 0.2)';
      case 'low': return 'rgba(102, 187, 106, 0.2)';
      default: return 'rgba(21, 34, 56, 0.8)';
    }
  }};
  border-color: ${props => {
    switch(props.value) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa726';
      case 'medium': return '#ffeb3b';
      case 'low': return '#66bb6a';
      default: return '#003366';
    }
  }};
`;

const FileUploadArea = styled.div`
  border: 2px dashed #003366;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: rgba(21, 34, 56, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover, &.dragover {
    border-color: #00ddff;
    background: rgba(0, 221, 255, 0.1);
    transform: translateY(-2px);
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const UploadText = styled.div`
  color: #99e6ff;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PreviewImage = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #152238;
  border: 1px solid #003366;

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: #ff6b6b;
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #00ddff 0%, #0099cc 100%);
  color: #000;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(0, 221, 255, 0.3);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(0, 221, 255, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  
  ${props => props.type === 'success' && `
    background: rgba(102, 187, 106, 0.2);
    border: 1px solid #66bb6a;
    color: #66bb6a;
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
  `}
`;

const BugReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'bug',
    reporterName: '',
    reporterEmail: '',
    environment: 'production',
    browser: '',
    steps: '',
    expected: '',
    actual: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up object URLs
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const uploadImages = async () => {
    const uploadPromises = images.map(async (image) => {
      const imageRef = ref(storage, `bug-reports/${Date.now()}-${image.file.name}`);
      const snapshot = await uploadBytes(imageRef, image.file);
      return await getDownloadURL(snapshot.ref);
    });
    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Upload images first
      const imageUrls = images.length > 0 ? await uploadImages() : [];

      // Create bug report
      const bugData = {
        ...formData,
        images: imageUrls,
        reporterId: auth.currentUser?.uid || null,
        reporterAuthEmail: auth.currentUser?.email || null,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        comments: 0,
        assignedTo: null,
        tags: [],
        resolved: false,
        resolvedAt: null,
        resolvedBy: null
      };

      const docRef = await addDoc(collection(db, 'bugs'), bugData);
      
      setMessageType('success');
      setMessage(`Problem rapportert! ID: ${docRef.id.substring(0, 8)}`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'bug',
        reporterName: '',
        reporterEmail: '',
        environment: 'production',
        browser: '',
        steps: '',
        expected: '',
        actual: ''
      });
      setImages([]);

    } catch (error) {
      console.error('Error submitting bug report:', error);
      setMessageType('error');
      setMessage('Feil ved innsending av rapport. Prøv igjen.');
    } finally {
      setLoading(false);
    }
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

  return (
    <BugContainer>
      <Header>
        <Title>
          <FiAlertTriangle />
          Problem Rapportering
        </Title>
        <Subtitle>
          Rapporter bugs, problemer eller forbedringsforslag
        </Subtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormRow columns="2fr 1fr">
          <FormGroup>
            <Label>
              <FiTag />
              Tittel på problemet *
            </Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Kort beskrivelse av problemet..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              {getPriorityIcon(formData.priority)}
              Prioritet
            </Label>
            <PrioritySelect
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">🟢 Lav</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 Høy</option>
              <option value="critical">🔴 Kritisk</option>
            </PrioritySelect>
          </FormGroup>
        </FormRow>

        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>
              <FiAlertTriangle />
              Kategori
            </Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="bug">⚠️ Bug</option>
              <option value="feature">✨ Feature Request</option>
              <option value="improvement">🔧 Forbedring</option>
              <option value="performance">⚡ Performance</option>
              <option value="ui">🎨 UI/UX</option>
              <option value="security">🔒 Sikkerhet</option>
              <option value="other">📝 Annet</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiCalendar />
              Miljø
            </Label>
            <Select
              name="environment"
              value={formData.environment}
              onChange={handleInputChange}
            >
              <option value="production">🔴 Produksjon</option>
              <option value="staging">🟡 Staging</option>
              <option value="development">🟢 Utvikling</option>
              <option value="testing">🔵 Testing</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>
              <FiUser />
              Ditt navn
            </Label>
            <Input
              type="text"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleInputChange}
              placeholder="Navn (valgfritt)"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <FiUser />
              Din e-post
            </Label>
            <Input
              type="email"
              name="reporterEmail"
              value={formData.reporterEmail}
              onChange={handleInputChange}
              placeholder="E-post for oppfølging (valgfritt)"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>
            <FiAlertTriangle />
            Detaljert beskrivelse *
          </Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Beskriv problemet så detaljert som mulig..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>
            📋 Steg for å reprodusere
          </Label>
          <TextArea
            name="steps"
            value={formData.steps}
            onChange={handleInputChange}
            placeholder="1. Gå til...&#10;2. Klikk på...&#10;3. Se at..."
          />
        </FormGroup>

        <FormRow columns="1fr 1fr">
          <FormGroup>
            <Label>
              ✅ Forventet resultat
            </Label>
            <TextArea
              name="expected"
              value={formData.expected}
              onChange={handleInputChange}
              placeholder="Hva forventet du skulle skje?"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              ❌ Faktisk resultat
            </Label>
            <TextArea
              name="actual"
              value={formData.actual}
              onChange={handleInputChange}
              placeholder="Hva skjedde i stedet?"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>
            🌐 Nettleser/Enhet
          </Label>
          <Input
            type="text"
            name="browser"
            value={formData.browser}
            onChange={handleInputChange}
            placeholder="f.eks. Chrome 118, Safari iOS 17, Firefox 119..."
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FiImage />
            Bilder/Skjermbilder
          </Label>
          <FileUploadArea>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
            <FiUpload size={32} color="#00ddff" />
            <UploadText>
              Klikk eller dra bilder hit
              <br />
              <small>PNG, JPG, GIF opptil 10MB</small>
            </UploadText>
          </FileUploadArea>

          {images.length > 0 && (
            <ImagePreview>
              {images.map(image => (
                <PreviewImage key={image.id}>
                  <img src={image.preview} alt="Preview" />
                  <RemoveImageButton onClick={() => removeImage(image.id)}>
                    <FiX />
                  </RemoveImageButton>
                </PreviewImage>
              ))}
            </ImagePreview>
          )}
        </FormGroup>

        <SubmitButton type="submit" disabled={loading || !formData.title || !formData.description}>
          {loading ? (
            <>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: '2px solid #000', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
              Sender...
            </>
          ) : (
            <>
              <FiSend />
              Send Rapport
            </>
          )}
        </SubmitButton>

        {message && (
          <StatusMessage type={messageType}>
            {messageType === 'success' ? '✅' : '❌'}
            {message}
          </StatusMessage>
        )}
      </Form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </BugContainer>
  );
};

export default BugReport;
