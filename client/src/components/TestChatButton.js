import React from 'react';
import styled from 'styled-components';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

const TestButton = styled.button`
  position: fixed;
  top: 100px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
  font-weight: bold;
  
  &:hover {
    background: #ff5252;
  }
`;

const TestChatButton = () => {
  const createMultipleTestChats = async () => {
    try {
      console.log('Creating multiple test chats...');
      
      for (let i = 1; i <= 3; i++) {
        const testUserId = `test-user-${Date.now()}-${i}`;
        console.log(`Creating test chat ${i} for user:`, testUserId);
        
        // First create the chat document
        const { doc, setDoc } = await import('../firebase');
        await setDoc(doc(db, 'chats', testUserId), {
          userId: testUserId,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          status: 'online'
        });
        
        // Create user message
        await addDoc(collection(db, 'chats', testUserId, 'messages'), {
          sender: 'user',
          text: `Hello, this is test message ${i} from user!`,
          timestamp: serverTimestamp(),
          userId: testUserId,
          country: 'Norway',
          language: 'en',
          read: false
        });
        
        // Create bot response
        await addDoc(collection(db, 'chats', testUserId, 'messages'), {
          sender: 'bot',
          text: `Hello! This is test response ${i} from the bot.`,
          timestamp: serverTimestamp(),
          userId: testUserId,
          language: 'en',
          read: true
        });
        
        console.log(`Test chat ${i} created successfully`);
      }
      
      alert('3 test chats created successfully! Check the admin panel.');
      
    } catch (error) {
      console.error('Error creating test chats:', error);
      alert('Error creating test chats: ' + error.message);
    }
  };

  const createTestChat = async () => {
    try {
      const testUserId = 'test-user-' + Date.now();
      console.log('Creating test chat for user:', testUserId);
      
      // First create the chat document to ensure the collection exists
      const { doc, setDoc } = await import('../firebase');
      await setDoc(doc(db, 'chats', testUserId), {
        userId: testUserId,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        status: 'online'
      });
      
      console.log('Test chat document created');
      
      // Create test user message
      const userMessageRef = await addDoc(collection(db, 'chats', testUserId, 'messages'), {
        sender: 'user',
        text: 'Hello, this is a test message from a user!',
        timestamp: serverTimestamp(),
        userId: testUserId,
        country: 'Norway',
        language: 'en',
        read: false
      });
      
      console.log('Test user message created:', userMessageRef.id);
      
      // Create test bot response
      const botMessageRef = await addDoc(collection(db, 'chats', testUserId, 'messages'), {
        sender: 'bot',
        text: 'Hello! This is a test response from the bot.',
        timestamp: serverTimestamp(),
        userId: testUserId,
        language: 'en',
        read: true
      });
      
      console.log('Test bot message created:', botMessageRef.id);
      
      alert('Test chat created successfully! Check the admin panel.');
      
    } catch (error) {
      console.error('Error creating test chat:', error);
      alert('Error creating test chat: ' + error.message);
    }
  };

  const deleteAllTestChats = async () => {
    if (!window.confirm('Are you sure you want to delete ALL test chats?')) return;
    
    try {
      console.log('Deleting all test chats...');
      
      const { getDocs, deleteDoc } = await import('../firebase');
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      
      let deletedCount = 0;
      for (const chatDoc of chatsSnapshot.docs) {
        const userId = chatDoc.id;
        if (userId.startsWith('test-user-')) {
          console.log('Deleting test chat:', userId);
          
          // Delete all messages first
          const messagesSnapshot = await getDocs(collection(db, 'chats', userId, 'messages'));
          for (const msgDoc of messagesSnapshot.docs) {
            await deleteDoc(msgDoc.ref);
          }
          
          // Delete the chat document
          await deleteDoc(chatDoc.ref);
          deletedCount++;
        }
      }
      
      alert(`Deleted ${deletedCount} test chats successfully!`);
      
    } catch (error) {
      console.error('Error deleting test chats:', error);
      alert('Error deleting test chats: ' + error.message);
    }
  };

  return (
    <>
      <TestButton onClick={createTestChat}>
        Create Test Chat
      </TestButton>
      <TestButton 
        onClick={createMultipleTestChats}
        style={{ top: '150px', background: '#4CAF50' }}
      >
        Create 3 Test Chats
      </TestButton>
      <TestButton 
        onClick={deleteAllTestChats}
        style={{ top: '200px', background: '#f44336' }}
      >
        Delete All Test Chats
      </TestButton>
    </>
  );
};

export default TestChatButton;
