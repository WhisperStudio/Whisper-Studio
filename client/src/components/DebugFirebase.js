import React from 'react';
import styled from 'styled-components';
import { db, collection, collectionGroup, getDocs } from '../firebase';

const DebugButton = styled.button`
  position: fixed;
  top: 150px;
  right: 20px;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
  font-weight: bold;
  
  &:hover {
    background: #45a049;
  }
`;

const DebugFirebase = () => {
  const debugFirebaseData = async () => {
    try {
      console.log('=== FIREBASE DEBUG START ===');
      
      // Check chats collection
      console.log('1. Checking chats collection...');
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      console.log(`Found ${chatsSnapshot.size} chat documents:`);
      chatsSnapshot.forEach(doc => {
        console.log(`- Chat ID: ${doc.id}`, doc.data());
      });
      
      // Check messages using collectionGroup
      console.log('2. Checking all messages using collectionGroup...');
      const messagesSnapshot = await getDocs(collectionGroup(db, 'messages'));
      console.log(`Found ${messagesSnapshot.size} total messages:`);
      
      const userGroups = {};
      messagesSnapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        if (userId) {
          if (!userGroups[userId]) {
            userGroups[userId] = [];
          }
          userGroups[userId].push({
            id: doc.id,
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp
          });
        }
      });
      
      console.log(`Messages grouped by ${Object.keys(userGroups).length} users:`);
      Object.keys(userGroups).forEach(userId => {
        console.log(`- User ${userId}: ${userGroups[userId].length} messages`);
        userGroups[userId].forEach(msg => {
          console.log(`  * ${msg.sender}: ${msg.text.substring(0, 50)}...`);
        });
      });
      
      // Check specific chat paths
      console.log('3. Checking specific chat paths...');
      for (const chatDoc of chatsSnapshot.docs) {
        const userId = chatDoc.id;
        const messagesRef = collection(db, 'chats', userId, 'messages');
        const userMessagesSnapshot = await getDocs(messagesRef);
        console.log(`User ${userId} has ${userMessagesSnapshot.size} messages in path chats/${userId}/messages`);
      }
      
      console.log('=== FIREBASE DEBUG END ===');
      
      alert(`Debug complete! Found ${chatsSnapshot.size} chats and ${messagesSnapshot.size} total messages. Check console for details.`);
      
    } catch (error) {
      console.error('Debug error:', error);
      alert('Debug error: ' + error.message);
    }
  };

  return (
    <DebugButton onClick={debugFirebaseData}>
      Debug Firebase
    </DebugButton>
  );
};

export default DebugFirebase;
