// Firebase admin utilities for user management
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  collection, 
  serverTimestamp,
  onAuthStateChanged,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc
} from '../firebase';

// Admin email addresses - add your admin emails here
const ADMIN_EMAILS = [
  'vintrastudio@gmail.com',
  'martin@secker.no',
  // Add more admin emails as needed
];

// Admin collection name in Firestore.
const ADMIN_COLLECTION = 'admins';

/**
 * Check if a user email is an admin
 */
export const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};

/**
 * Get or create user document in Firestore
 */
export const getOrCreateUser = async (firebaseUser) => {
  if (!firebaseUser) return null;

  try {
    // First check if user document exists by UID
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: firebaseUser.uid, ...userDoc.data() };
    } else {
      // Check if user exists by email (in case of different auth methods)
      const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0];
        return { id: existingUser.id, ...existingUser.data() };
      }

      // Create new user document with UID as document ID
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        role: isAdminEmail(firebaseUser.email) ? 'admin' : 'pending', // New users start as pending
        permissions: [], // Empty permissions by default
        provider: firebaseUser.providerData?.[0]?.providerId || 'password',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastActivity: serverTimestamp()
      };

      // Use setDoc instead of addDoc to use UID as document ID
      await setDoc(userRef, userData);
      return { id: firebaseUser.uid, ...userData };
    }
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return null;
  }
};

/**
 * Check if current user has access to admin panel
 * This includes: owner, admin, and support roles
 */
export const checkAdminStatus = async (user) => {
  if (!user) return false;
  
  try {
    // Owner emails (highest priority)
    const ownerEmails = [
      'vintrastudio@gmail.com',
      'vintra@whisper.no',
      'vintra@example.com'
    ];
    
    if (ownerEmails.includes(user.email?.toLowerCase())) {
      await ensureAdminInFirestore(user);
      return true;
    }
    
    // Check by email in ADMIN_EMAILS list
    if (isAdminEmail(user.email)) {
      await ensureAdminInFirestore(user);
      return true;
    }

    // Check Firestore user document for role
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Allow owner, admin, and support roles to access admin panel
      if (userData.role === 'owner' || userData.role === 'admin' || userData.role === 'support') {
        if (userData.role === 'admin' || userData.role === 'owner') {
          await ensureAdminInFirestore(user);
        }
        return true;
      }
    }
    
    // Check admins collection directly
    const adminRef = doc(db, ADMIN_COLLECTION, user.uid);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      // Update user document to reflect admin status
      await getOrCreateUser(user);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Fallback to email check
    return isAdminEmail(user.email);
  }
};

/**
 * Ensure admin user is properly stored in Firestore admins collection
 */
export const ensureAdminInFirestore = async (user) => {
  if (!user) return;
  
  try {
    const adminRef = doc(db, ADMIN_COLLECTION, user.uid);
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      // Create admin document
      const adminData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: true,
        addedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await setDoc(adminRef, adminData);
      console.log('Admin user added to Firestore:', user.email);
    } else {
      // Update last login
      await setDoc(adminRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error ensuring admin in Firestore:', error);
  }
};

/**
 * Get all admins from Firestore
 */
export const getAllAdmins = async () => {
  try {
    const adminsRef = collection(db, ADMIN_COLLECTION);
    const snapshot = await getDocs(adminsRef);
    const admins = [];
    
    snapshot.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() });
    });
    
    return admins;
  } catch (error) {
    console.error('Error getting all admins:', error);
    return [];
  }
};

/**
 * Add a new admin by email
 */
export const addAdminByEmail = async (email, currentUser) => {
  if (!currentUser || !await checkAdminStatus(currentUser)) {
    throw new Error('Only admins can add new admins');
  }
  
  try {
    // Check if user exists in users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Add to admins collection
      const adminRef = doc(db, ADMIN_COLLECTION, userDoc.id);
      await setDoc(adminRef, {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        isAdmin: true,
        addedAt: serverTimestamp(),
        addedBy: currentUser.uid
      });
      
      // Update user role
      await setDoc(doc(db, 'users', userDoc.id), {
        role: 'admin'
      }, { merge: true });
      
      return { success: true, message: `Admin added: ${email}` };
    } else {
      return { success: false, message: 'User not found. They need to log in first.' };
    }
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

/**
 * Remove admin status
 */
export const removeAdmin = async (adminId, currentUser) => {
  if (!currentUser || !await checkAdminStatus(currentUser)) {
    throw new Error('Only admins can remove admin status');
  }
  
  if (adminId === currentUser.uid) {
    throw new Error('Cannot remove your own admin status');
  }
  
  try {
    // Remove from admins collection
    const adminRef = doc(db, ADMIN_COLLECTION, adminId);
    await deleteDoc(adminRef);
    
    // Update user role
    await setDoc(doc(db, 'users', adminId), {
      role: 'user'
    }, { merge: true });
    
    return { success: true, message: 'Admin status removed' };
  } catch (error) {
    console.error('Error removing admin:', error);
    throw error;
  }
};

/**
 * Auth state listener hook
 */
export const useAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user with admin status
 */
export const getCurrentUserWithRole = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await checkAdminStatus(user);
        resolve({
          user,
          isAdmin,
          role: isAdmin ? 'admin' : 'user'
        });
      } else {
        resolve({ user: null, isAdmin: false, role: null });
      }
      unsubscribe();
    });
  });
};
