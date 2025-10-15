import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteField
} from '../firebase';
import {
  FiSend,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiSearch,
  FiHash,
  FiPlusCircle,
  FiX,
  FiUsers,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSmile,
  FiCheck,
  FiCheckCircle as FiCheckDouble,
  FiMoreHorizontal,
  FiPaperclip,
  FiCornerUpLeft,
  FiArrowDown,
  FiImage,
  FiFile
} from 'react-icons/fi';
import './AdminTeamChat.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Alle meldinger' },
  { value: 'me', label: 'Mine meldinger' },
  { value: 'system', label: 'Systemmeldinger' },
  { value: 'pinned', label: 'Festede meldinger' }
];

const EMOJI_REACTIONS = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

const formatTime = date => {
  if (!date) return 'Ukjent';
  
  // Ensure date is a Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Ukjent';
  
  const now = new Date();
  const diff = Math.max(1, Math.floor((now.getTime() - dateObj.getTime()) / 60000));
  if (diff < 1) {
    return 'Nå nettopp';
  }
  if (diff < 60) {
    return `${diff} min`;
  }
  const hours = Math.floor(diff / 60);
  if (hours < 24) {
    return `${hours}t`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'I går';
  }
  if (days < 7) {
    return `${days}d`;
  }
  return dateObj.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' });
};

const formatFullTime = date => {
  if (!date) return 'Ukjent';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return 'Ukjent';
  
  return dateObj.toLocaleString('no-NO', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const initialsFor = (name, email) => {
  if (name && name.trim()) {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email) {
    return email[0]?.toUpperCase() || 'A';
  }
  return 'A';
};

const AdminTeamChat = ({ currentUser, role }) => {
  const [topic, setTopic] = useState('Lagkoordinering og viktige oppdateringer');
  const [topicDraft, setTopicDraft] = useState('');
  const [editingTopic, setEditingTopic] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const typingTimeoutRef = useRef({});
  const fileInputRef = useRef(null);
  const roomId = 'global';
  const canModerate = role === 'owner' || role === 'admin';
  const messagesContainerRef = useRef(null);
  const autoScrollRef = useRef(true);
  const roomRef = useMemo(() => doc(db, 'adminTeamRooms', roomId), [roomId]);
  const messagesRef = useMemo(() => collection(db, 'adminTeamRooms', roomId, 'messages'), [roomId]);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    const ensureRoom = async () => {
      await setDoc(
        roomRef,
        {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    };

    ensureRoom();

    const unsubscribeRoom = onSnapshot(roomRef, snapshot => {
      if (!snapshot.exists()) {
        return;
      }
      const data = snapshot.data();
      if (data.topic) {
        setTopic(data.topic);
      }
      setPinnedMessage(data.pinnedMessage || null);
      if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      }
    });

    const unsubscribeMessages = onSnapshot(
      query(messagesRef, orderBy('createdAt', 'asc')),
      snapshot => {
        const nextMessages = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            text: data.text || '',
            senderId: data.senderId || 'system',
            senderName: data.senderName || 'System',
            senderEmail: data.senderEmail || '',
            senderInitial: data.senderInitial || 'S',
            isSystem: Boolean(data.isSystem),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            editedAt: data.editedAt?.toDate?.() || null,
            reactions: data.reactions || {},
            status: data.status || 'sent',
            replyTo: data.replyTo || null,
            fileUrl: data.fileUrl || null,
            fileName: data.fileName || null,
            fileType: data.fileType || null
          };
        });
        setMessages(nextMessages);
        setLoading(false);
        if (autoScrollRef.current && messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [currentUser, roomRef, messagesRef]);

  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      autoScrollRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom && messages.length > 0);
      
      // Count unread messages
      if (!isNearBottom) {
        const unreadMessages = messages.filter(m => {
          const msgElement = document.getElementById(`msg-${m.id}`);
          if (!msgElement) return false;
          const rect = msgElement.getBoundingClientRect();
          const containerRect = messagesContainerRef.current.getBoundingClientRect();
          return rect.top > containerRect.bottom;
        }).length;
        setUnreadCount(unreadMessages);
      } else {
        setUnreadCount(0);
      }
    };

    const element = messagesContainerRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const visibleMessages = useMemo(() => {
    return messages
      .map(message => ({
        ...message,
        pinned: Boolean(pinnedMessage && pinnedMessage.id === message.id)
      }))
      .filter(message => {
        if (filter === 'me' && message.senderId !== currentUser?.uid) {
          return false;
        }
        if (filter === 'system' && !message.isSystem) {
          return false;
        }
        if (filter === 'pinned' && !message.pinned) {
          return false;
        }
        if (!searchTerm.trim()) {
          return true;
        }
        const haystack = `${message.text} ${message.senderName}`.toLowerCase();
        return haystack.includes(searchTerm.trim().toLowerCase());
      });
  }, [messages, pinnedMessage, filter, searchTerm, currentUser]);

  const activeAdmins = useMemo(() => {
    const ids = new Set(messages.filter(item => !item.isSystem).map(item => item.senderId));
    if (currentUser?.uid) {
      ids.add(currentUser.uid);
    }
    return ids.size;
  }, [messages, currentUser]);

  const handleSend = async () => {
    if (!currentUser || !input.trim()) {
      return;
    }
    const value = input.trim();
    setSending(true);
    try {
      await addDoc(messagesRef, {
        text: value,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || 'Admin',
        senderEmail: currentUser.email || '',
        senderInitial: initialsFor(currentUser.displayName, currentUser.email),
        createdAt: serverTimestamp(),
        isSystem: false,
        reactions: {},
        status: 'sent',
        replyTo: replyingTo || null
      });
      setReplyingTo(null);
      await updateDoc(roomRef, {
        updatedAt: serverTimestamp()
      });
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const postSystemMessage = async text => {
    await addDoc(messagesRef, {
      text,
      senderId: 'system',
      senderName: 'System',
      senderInitial: 'SYS',
      isSystem: true,
      createdAt: serverTimestamp()
    });
    await updateDoc(roomRef, {
      updatedAt: serverTimestamp()
    });
  };

  const beginEdit = message => {
    if (message.isSystem) {
      return;
    }
    const isOwn = message.senderId === currentUser?.uid;
    if (!isOwn && !canModerate) {
      return;
    }
    setEditingMessageId(message.id);
    setEditDraft(message.text);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditDraft('');
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editDraft.trim()) {
      return;
    }
    await updateDoc(doc(messagesRef, editingMessageId), {
      text: editDraft.trim(),
      editedAt: serverTimestamp()
    });
    setEditingMessageId(null);
    setEditDraft('');
  };

  const deleteMessage = async message => {
    const isOwn = message.senderId === currentUser?.uid;
    if ((!isOwn && !canModerate) || message.isSystem) {
      return;
    }
    if (!window.confirm('Er du sikker på at du vil slette meldingen?')) {
      return;
    }
    await deleteDoc(doc(messagesRef, message.id));
  };

  const togglePin = async message => {
    if (!canModerate) {
      return;
    }
    const currentlyPinned = pinnedMessage && pinnedMessage.id === message.id;
    if (currentlyPinned) {
      await updateDoc(roomRef, {
        pinnedMessage: deleteField()
      });
      return;
    }
    await updateDoc(roomRef, {
      pinnedMessage: {
        id: message.id,
        text: message.text,
        senderName: message.senderName,
        createdAt: message.createdAt
      }
    });
  };

  const addAnnouncement = async () => {
    if (!announcementDraft.trim()) {
      return;
    }
    await updateDoc(roomRef, {
      announcements: arrayUnion({
        id: Date.now().toString(),
        text: announcementDraft.trim(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.displayName || currentUser?.email || 'Admin'
      })
    });
    setAnnouncementDraft('');
  };

  const removeAnnouncement = async announcement => {
    if (!canModerate) {
      return;
    }
    await updateDoc(roomRef, {
      announcements: arrayRemove(announcement)
    });
  };

  const saveTopic = async () => {
    if (!topicDraft.trim()) {
      setEditingTopic(false);
      setTopicDraft('');
      return;
    }
    await updateDoc(roomRef, {
      topic: topicDraft.trim(),
      updatedAt: serverTimestamp()
    });
    setEditingTopic(false);
    setTopicDraft('');
  };

  const handleComposerKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleComposerChange = event => {
    setInput(event.target.value);
    // Typing indicator logic could go here
  };

  const toggleReaction = async (messageId, emoji) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !currentUser) return;

    const reactions = message.reactions || {};
    const userReactions = reactions[emoji] || [];
    const hasReacted = userReactions.includes(currentUser.uid);

    let updatedReactions;
    if (hasReacted) {
      // Remove reaction
      updatedReactions = {
        ...reactions,
        [emoji]: userReactions.filter(uid => uid !== currentUser.uid)
      };
      // Clean up empty arrays
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      // Add reaction
      updatedReactions = {
        ...reactions,
        [emoji]: [...userReactions, currentUser.uid]
      };
    }

    await updateDoc(doc(messagesRef, messageId), {
      reactions: updatedReactions
    });
    setShowEmojiPicker(null);
  };

  const copyMessage = text => {
    navigator.clipboard.writeText(text);
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Simulate file upload (in production, upload to Firebase Storage)
    setUploadingFile(true);
    try {
      // For demo purposes, create a data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = {
          text: `Delte en fil: ${file.name}`,
          senderId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email || 'Admin',
          senderEmail: currentUser.email || '',
          senderInitial: initialsFor(currentUser.displayName, currentUser.email),
          createdAt: serverTimestamp(),
          isSystem: false,
          reactions: {},
          status: 'sent',
          fileName: file.name,
          fileType: file.type,
          fileUrl: e.target.result // In production, use Firebase Storage URL
        };
        
        await addDoc(messagesRef, fileData);
        await updateDoc(roomRef, {
          updatedAt: serverTimestamp()
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startReply = (message) => {
    setReplyingTo({
      id: message.id,
      text: message.text,
      senderName: message.senderName
    });
  };

  if (!currentUser) {
    return (
      <div className="admin-chat admin-chat--empty">
        <div className="admin-chat__placeholder">
          <FiAlertCircle size={32} />
          <p>Logg inn for å bruke admin-chatten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat">
      <div className="admin-chat__header">
        <div className="admin-chat__topic">
          <div className="admin-chat__topic-label">
            <h2>{editingTopic ? 'Rediger kanaltema' : topic}</h2>
          </div>
          <div className="admin-chat__topic-meta">
            <span className="admin-chat__online">
              <FiUsers /> {activeAdmins} aktive
            </span>
          </div>
          {editingTopic ? (
            <div className="admin-chat__topic-edit">
              <input
                value={topicDraft}
                onChange={event => setTopicDraft(event.target.value)}
                placeholder="Nytt tema for kanalen"
              />
              <button type="button" className="admin-chat__icon-button" onClick={saveTopic}>
                <FiCheckCircle />
              </button>
              <button
                type="button"
                className="admin-chat__icon-button"
                onClick={() => {
                  setEditingTopic(false);
                  setTopicDraft('');
                }}
              >
                <FiX />
              </button>
            </div>
          ) : (
            canModerate && (
              <button
                type="button"
                className="admin-chat__icon-button"
                onClick={() => {
                  setEditingTopic(true);
                  setTopicDraft(topic);
                }}
                title="Rediger tema"
              >
                <FiEdit3 />
              </button>
            )
          )}
        </div>
        <div className="admin-chat__toolbar">
          <select
            className="admin-chat__select"
            value={filter}
            onChange={event => setFilter(event.target.value)}
          >
            {FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="admin-chat__search">
            <FiSearch />
            <input
              placeholder="Søk i meldinger"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>



      <div className="admin-chat__body">
        <div className="admin-chat__messages" ref={messagesContainerRef}>
          {loading ? (
            <div className="admin-chat__placeholder">
              <FiClock size={24} />
              <p>Laster meldinger...</p>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="admin-chat__placeholder">
              <FiAlertCircle size={24} />
              <p>Ingen meldinger matcher filtrene dine.</p>
            </div>
          ) : (
            visibleMessages.map((message, index) => {
              const isEditing = editingMessageId === message.id;
              const isOwn = message.senderId === currentUser.uid;
              
              // Check if we should group with previous message
              const prevMessage = visibleMessages[index - 1];
              const isGrouped = prevMessage && 
                prevMessage.senderId === message.senderId && 
                !prevMessage.isSystem && !message.isSystem &&
                (message.createdAt.getTime() - prevMessage.createdAt.getTime()) < 60000; // Within 1 min
              
              const messageClasses = [
                'admin-chat__message',
                message.isSystem ? 'admin-chat__message--system' : '',
                message.pinned ? 'admin-chat__message--pinned' : '',
                isOwn ? 'admin-chat__message--own' : '',
                isGrouped ? 'admin-chat__message--grouped' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={message.id} id={`msg-${message.id}`} className={messageClasses}>
                  {!message.isSystem && !isGrouped && (
                    <div className="admin-chat__avatar" title={message.senderName}>
                      {message.senderInitial || 'A'}
                    </div>
                  )}
                  {!message.isSystem && isGrouped && <div className="admin-chat__avatar-spacer" />}
                  <div className="admin-chat__message-body">
                    {!isGrouped && (
                      <header>
                        <span className="admin-chat__author">{message.senderName}</span>
                        <small title={formatFullTime(message.createdAt)}>{formatTime(message.createdAt)}</small>
                        {message.editedAt && <small>(redigert)</small>}
                      </header>
                    )}
                    {message.replyTo && (
                      <div className="admin-chat__reply-preview">
                        <FiCornerUpLeft size={14} />
                        <div className="admin-chat__reply-content">
                          <span className="admin-chat__reply-author">{message.replyTo.senderName || 'Ukjent'}</span>
                          <span className="admin-chat__reply-text">{message.replyTo.text?.substring(0, 50) || '...'}</span>
                        </div>
                      </div>
                    )}
                    {isEditing ? (
                      <textarea
                        value={editDraft}
                        onChange={event => setEditDraft(event.target.value)}
                      />
                    ) : (
                      <>
                        <p>{message.text}</p>
                        {message.fileUrl && (
                          <div className="admin-chat__file-attachment">
                            {message.fileType?.startsWith('image/') ? (
                              <img src={message.fileUrl} alt={message.fileName} className="admin-chat__image-preview" />
                            ) : (
                              <div className="admin-chat__file-card">
                                <FiFile size={24} />
                                <div className="admin-chat__file-info">
                                  <span className="admin-chat__file-name">{message.fileName}</span>
                                  <span className="admin-chat__file-size">Fil</span>
                                </div>
                                <a href={message.fileUrl} download={message.fileName} className="admin-chat__file-download">
                                  Last ned
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {Object.keys(message.reactions || {}).length > 0 && (
                          <div className="admin-chat__reactions">
                            {Object.entries(message.reactions).map(([emoji, users]) => (
                              users.length > 0 && (
                                <button
                                  key={emoji}
                                  type="button"
                                  className={`admin-chat__reaction-chip ${users.includes(currentUser.uid) ? 'admin-chat__reaction-chip--active' : ''}`}
                                  onClick={() => toggleReaction(message.id, emoji)}
                                  title={`Reagert av ${users.length} person(er)`}
                                >
                                  <span>{emoji}</span>
                                  <span className="admin-chat__reaction-count">{users.length}</span>
                                </button>
                              )
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <footer className="admin-chat__message-footer">
                      {isEditing ? (
                        <div className="admin-chat__edit-actions">
                          <button type="button" onClick={saveEdit} className="admin-chat__action-save">Lagre</button>
                          <button type="button" onClick={cancelEdit} className="admin-chat__action-cancel">Avbryt</button>
                        </div>
                      ) : (
                        !message.isSystem && (
                          <div className="admin-chat__message-actions">
                            <button 
                              type="button" 
                              className="admin-chat__action-btn"
                              onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                              title="Reager"
                            >
                              <FiSmile />
                            </button>
                            {showEmojiPicker === message.id && (
                              <div className="admin-chat__emoji-picker">
                                {EMOJI_REACTIONS.map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => toggleReaction(message.id, emoji)}
                                    className="admin-chat__emoji-btn"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                            <button 
                              type="button" 
                              className="admin-chat__action-btn"
                              onClick={() => startReply(message)}
                              title="Svar"
                            >
                              <FiCornerUpLeft />
                            </button>
                            {isOwn && (
                              <button type="button" onClick={() => beginEdit(message)} className="admin-chat__action-btn" title="Rediger">
                                <FiEdit3 />
                              </button>
                            )}
                            {isOwn && (
                              <button type="button" onClick={() => deleteMessage(message)} className="admin-chat__action-btn admin-chat__action-btn--danger" title="Slett">
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        )
                      )}
                      {isOwn && message.status && (
                        <div className="admin-chat__message-status">
                          {message.status === 'sending' && <FiClock size={12} />}
                          {message.status === 'sent' && <FiCheck size={12} />}
                          {message.status === 'read' && <FiCheckDouble size={12} />}
                        </div>
                      )}
                    </footer>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showScrollButton && (
          <button 
            type="button" 
            className="admin-chat__scroll-button"
            onClick={() => scrollToBottom()}
            title="Gå til bunnen"
          >
            <FiArrowDown />
            {unreadCount > 0 && (
              <span className="admin-chat__unread-badge">{unreadCount}</span>
            )}
          </button>
        )}

        {replyingTo && (
          <div className="admin-chat__reply-bar">
            <div className="admin-chat__reply-info">
              <FiCornerUpLeft size={16} />
              <div>
                <strong>Svarer til {replyingTo.senderName}</strong>
                <p>{replyingTo.text?.substring(0, 60)}{replyingTo.text?.length > 60 ? '...' : ''}</p>
              </div>
            </div>
            <button type="button" onClick={() => setReplyingTo(null)} className="admin-chat__reply-close">
              <FiX />
            </button>
          </div>
        )}

        <div className="admin-chat__composer">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button 
            type="button" 
            className="admin-chat__attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            title="Legg ved fil"
          >
            {uploadingFile ? <FiClock /> : <FiPaperclip />}
          </button>
          <textarea
            placeholder="Skriv en melding til admin-teamet..."
            value={input}
            onChange={handleComposerChange}
            onKeyDown={handleComposerKeyDown}
            rows={1}
          />
          <button 
            type="button" 
            onClick={handleSend} 
            disabled={sending || !input.trim()}
            className="admin-chat__send-btn"
          >
            {sending ? (
              <>
                <FiClock />
                <span>Sender...</span>
              </>
            ) : (
              <>
                <FiSend />
                <span>Send</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminTeamChat;
