import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, get, update, remove, child } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // URL cho Realtime Database
};

// Log Firebase config for debugging (without sensitive values)
console.log('Firebase config check:');
console.log('- API Key present:', !!firebaseConfig.apiKey);
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Database URL:', firebaseConfig.databaseURL);

// Check if Firebase config is valid
const isFirebaseConfigValid = firebaseConfig.apiKey &&
                             firebaseConfig.apiKey !== 'your-api-key' &&
                             firebaseConfig.databaseURL &&
                             firebaseConfig.databaseURL !== 'your-project-id-default-rtdb.region.firebasedatabase.app';

// Check specifically for database URL
if (!firebaseConfig.databaseURL) {
  console.error('Firebase Realtime Database URL is missing. Please add NEXT_PUBLIC_FIREBASE_DATABASE_URL to your .env.local file.');
} else if (firebaseConfig.databaseURL === 'your-project-id-default-rtdb.region.firebasedatabase.app') {
  console.error('Firebase Realtime Database URL is not configured. Please update NEXT_PUBLIC_FIREBASE_DATABASE_URL in your .env.local file.');
} else if (firebaseConfig.databaseURL.endsWith('/')) {
  console.warn('Firebase Realtime Database URL should not end with a slash. Current value:', firebaseConfig.databaseURL);
  // Remove trailing slash if present
  firebaseConfig.databaseURL = firebaseConfig.databaseURL.replace(/\/$/, '');
  console.log('Updated Database URL:', firebaseConfig.databaseURL);
}

// Initialize Firebase only if config is valid
let app;
let auth;
let db;
let rtdb; // Realtime Database

try {
  if (isFirebaseConfigValid) {
    console.log('Initializing Firebase with valid configuration');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Realtime Database with additional error handling
    try {
      console.log('Initializing Realtime Database with URL:', firebaseConfig.databaseURL);
      rtdb = getDatabase(app);
      console.log('Realtime Database initialized successfully');
    } catch (rtdbError) {
      console.error('Error initializing Realtime Database:', rtdbError);
      // Continue without Realtime Database
    }
  } else {
    console.warn('Firebase configuration is incomplete or invalid. Some features may not work properly.');
    // Initialize app with minimal config to prevent crashes
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      console.log('Initializing Firebase with minimal configuration');
      const minimalConfig = {
        apiKey: firebaseConfig.apiKey,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain || `${firebaseConfig.projectId}.firebaseapp.com`,
      };

      // Add database URL if available
      if (firebaseConfig.databaseURL) {
        minimalConfig['databaseURL'] = firebaseConfig.databaseURL;
        console.log('Including Database URL in minimal config');
      }

      app = getApps().length === 0 ? initializeApp(minimalConfig) : getApps()[0];

      // Try to initialize auth at minimum
      try {
        auth = getAuth(app);
        console.log('Firebase Auth initialized with minimal config');
      } catch (authError) {
        console.error('Error initializing Firebase Auth:', authError);
      }

      // Try to initialize Realtime Database if URL is available
      if (firebaseConfig.databaseURL) {
        try {
          console.log('Attempting to initialize Realtime Database with minimal config');
          rtdb = getDatabase(app);
          console.log('Realtime Database initialized with minimal config');
        } catch (rtdbError) {
          console.error('Error initializing Realtime Database with minimal config:', rtdbError);
        }
      }
    }
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Auth functions
export const registerUser = async (email: string, password: string, role: string = 'user') => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Store user role and basic info in the database
    if (rtdb) {
      // Store user data in users collection
      const userRef = ref(rtdb, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email: userCredential.user.email,
        role: role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL || '',
      });

      // If this is an admin user, also add to admins collection
      if (role === 'admin') {
        const adminRef = ref(rtdb, `admins/${userCredential.user.uid}`);
        await set(adminRef, {
          email: userCredential.user.email,
          isAdmin: true,
          createdAt: serverTimestamp()
        });
      }
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Update last login time
    if (rtdb) {
      const userRef = ref(rtdb, `users/${userCredential.user.uid}`);
      await update(userRef, {
        lastLogin: serverTimestamp()
      });
    }

    return userCredential.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  if (!auth) {
    throw new Error('Firebase authentication is not initialized');
  }

  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message);
  }
};

// User data functions
export const createUserProfile = async (userId: string, userData: any) => {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Create user profile error:', error);
    throw new Error(error.message);
  }
};

export const getUserProfile = async (userId: string) => {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Get user profile error:', error);
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Update user profile error:', error);
    throw new Error(error.message);
  }
};

// Order functions
export const createOrder = async (userId: string, orderData: any) => {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }

  try {
    const ordersRef = collection(db, 'orders');
    const newOrderRef = doc(ordersRef);

    await setDoc(newOrderRef, {
      userId,
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newOrderRef.id;
  } catch (error: any) {
    console.error('Create order error:', error);
    throw new Error(error.message);
  }
};

// Email notification function - simplified version
export const sendOrderNotification = async (orderData: any, userEmail: string) => {
  if (!db) {
    console.warn('Firebase Firestore is not initialized, skipping order notification');
    return false;
  }

  try {
    // Store order notification in Firestore for reference
    const notificationsRef = collection(db, 'notifications');
    await setDoc(doc(notificationsRef), {
      to: 'lnduc19502@gmail.com',
      orderData,
      userEmail,
      createdAt: serverTimestamp(),
      sent: true, // Assume sent for simplicity
    });

    // In a real implementation, you would integrate with an email service
    // For now, we'll just log the notification and store it in Firestore
    console.log(`Order notification for ${orderData.orderId} has been created`);

    return true;
  } catch (error: any) {
    console.error('Error creating order notification:', error);
    throw new Error(error.message);
  }
};

// Realtime Database functions for user profiles
export const createUserProfileRTDB = async (userId: string, userData: any) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to save user profile to RTDB for user:', userId);
    console.log('RTDB instance:', rtdb);
    console.log('Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);

    // Ensure the path is correct
    const userPath = `users/${userId}`;
    console.log('User path:', userPath);

    const userRef = ref(rtdb, userPath);
    console.log('User ref created:', userRef);

    const dataToSave = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Data to save:', dataToSave);

    // Use set with explicit error handling
    await set(userRef, dataToSave)
      .then(() => {
        console.log('User profile saved successfully to RTDB');
      })
      .catch((setError) => {
        console.error('Error during set operation:', setError);
        throw setError;
      });
  } catch (error: any) {
    console.error('Create user profile error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to save user profile: ${error.message}`);
  }
};

export const getUserProfileRTDB = async (userId: string) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when getting user profile');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to get user profile from RTDB for user:', userId);

    // Ensure the path is correct
    const userPath = `users/${userId}`;
    console.log('User path for get:', userPath);

    const userRef = ref(rtdb, userPath);
    console.log('User ref created for get:', userRef);

    const snapshot = await get(userRef);
    console.log('Snapshot received:', snapshot.exists() ? 'Data exists' : 'No data');

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log('User data retrieved successfully:', userData);
      return userData;
    } else {
      console.log('No user data found in RTDB');
      return null;
    }
  } catch (error: any) {
    console.error('Get user profile error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};

export const updateUserProfileRTDB = async (userId: string, userData: any) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when updating user profile');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to update user profile in RTDB for user:', userId);

    // Ensure the path is correct
    const userPath = `users/${userId}`;
    console.log('User path for update:', userPath);

    const userRef = ref(rtdb, userPath);
    console.log('User ref created for update:', userRef);

    const dataToUpdate = {
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    console.log('Data to update:', dataToUpdate);

    // Use update with explicit error handling
    await update(userRef, dataToUpdate)
      .then(() => {
        console.log('User profile updated successfully in RTDB');
      })
      .catch((updateError) => {
        console.error('Error during update operation:', updateError);
        throw updateError;
      });
  } catch (error: any) {
    console.error('Update user profile error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

// Create order in Realtime Database
export const createOrderRTDB = async (userId: string, orderData: any) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when creating order');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to save order to RTDB for user:', userId);
    console.log('RTDB instance:', rtdb);
    console.log('Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);

    // Generate a unique ID for the order if not provided
    const orderId = orderData.orderId || `order-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log('Generated order ID:', orderId);

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Prepare order data with additional fields
    const dataToSave = {
      orderId,
      userId,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      total: orderData.total || 0,
      customerInfo: {
        name: orderData.customerInfo?.name || '',
        email: orderData.customerInfo?.email || '',
        phone: orderData.customerInfo?.phone || '',
        address: orderData.customerInfo?.address || '',
      },
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: orderData.paymentMethod || 'COD',
      shippingMethod: orderData.shippingMethod || 'standard',
      notes: orderData.notes || '',
      createdAt: timestamp,
      updatedAt: timestamp,
      orderDate: orderData.orderDate || timestamp,
      statusHistory: [
        {
          status: 'pending',
          timestamp: timestamp,
          note: 'Đơn hàng mới được tạo'
        }
      ]
    };
    console.log('Order data to save:', dataToSave);

    // Log permission information
    console.log('Attempting to write to Realtime Database...');
    console.log('User ID:', userId);
    console.log('Authentication status:', auth?.currentUser ? 'Logged in' : 'Not logged in');

    // Save order in two key locations:

    // 1. In the global orders collection (for admin access)
    const orderRef = ref(rtdb, `orders/${orderId}`);
    console.log('Order ref path:', `orders/${orderId}`);

    // 2. Add order_id to user's orders list (for user's order history)
    const userOrderRef = ref(rtdb, `users/${userId}/orders/${orderId}`);
    console.log('User order ref path:', `users/${userId}/orders/${orderId}`);

    // Try each write individually for better error reporting
    try {
      console.log('Saving main order data...');
      await set(orderRef, dataToSave);
      console.log('Main order data saved successfully');
    } catch (mainOrderError) {
      console.error('Error saving main order data:', mainOrderError);
      throw new Error(`Failed to save main order: ${mainOrderError.message}`);
    }

    try {
      console.log('Adding order ID to user profile...');
      // Just store the order ID and timestamp for reference
      await set(userOrderRef, {
        orderId,
        timestamp: dataToSave.createdAt
      });
      console.log('Order ID added to user profile successfully');
    } catch (userOrderError) {
      console.error('Error adding order ID to user profile:', userOrderError);
      // Continue even if this write fails
    }

    console.log('Order saved successfully to RTDB');
    return orderId;
  } catch (error: any) {
    console.error('Create order error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to save order: ${error.message}`);
  }
};

// Get user's order history from Realtime Database
export const getUserOrdersRTDB = async (userId: string) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when getting user orders');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to get order history for user:', userId);

    // Reference to the user's orders
    const userOrdersRef = ref(rtdb, `users/${userId}/orders`);
    console.log('User orders ref created:', userOrdersRef);

    // Get the user's order IDs
    const snapshot = await get(userOrdersRef);

    if (!snapshot.exists()) {
      console.log('No orders found for user');
      return [];
    }

    const orderIds = snapshot.val();
    console.log('User order IDs retrieved:', orderIds);

    // Fetch detailed order information for each order ID
    const orderPromises = Object.entries(orderIds).map(async ([key, value]: [string, any]) => {
      const orderId = key; // The key is the order ID

      try {
        // Get detailed order information from the orders collection
        const orderRef = ref(rtdb, `orders/${orderId}`);
        const orderSnapshot = await get(orderRef);

        if (orderSnapshot.exists()) {
          return {
            ...orderSnapshot.val(),
            id: orderId // Ensure the order ID is included
          };
        } else {
          console.warn(`Order ${orderId} not found in orders collection`);
          return null;
        }
      } catch (orderError) {
        console.error(`Error fetching order ${orderId}:`, orderError);
        return null;
      }
    });

    // Wait for all order details to be fetched
    const orders = await Promise.all(orderPromises);

    // Filter out any null values (orders that couldn't be fetched) and sort by createdAt (newest first)
    const validOrders = orders.filter(order => order !== null).sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return validOrders;
  } catch (error: any) {
    console.error('Get user orders error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to get user orders: ${error.message}`);
  }
};

// Get detailed information for a specific order
export const getOrderDetailsRTDB = async (orderId: string) => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when getting order details');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log('Attempting to get details for order:', orderId);

    // Reference to the order
    const orderRef = ref(rtdb, `orders/${orderId}`);
    console.log('Order ref created:', orderRef);

    // Get the order data
    const snapshot = await get(orderRef);

    if (!snapshot.exists()) {
      console.log('Order not found');
      throw new Error('Order not found');
    }

    const orderData = snapshot.val();
    console.log('Order details retrieved:', orderData);

    return orderData;
  } catch (error: any) {
    console.error('Get order details error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to get order details: ${error.message}`);
  }
};

// Update order status
export const updateOrderStatusRTDB = async (orderId: string, newStatus: string, note: string = '') => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized when updating order status');
    throw new Error('Firebase Realtime Database is not initialized');
  }

  try {
    console.log(`Attempting to update order ${orderId} status to ${newStatus}`);

    // First get the current order to get the userId and other details
    const orderData = await getOrderDetailsRTDB(orderId);
    const userId = orderData.userId;
    const oldStatus = orderData.status;

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Create status history entry
    const statusEntry = {
      status: newStatus,
      timestamp: timestamp,
      note: note || `Trạng thái đơn hàng thay đổi thành ${newStatus}`
    };

    // Update the main order
    const orderRef = ref(rtdb, `orders/${orderId}`);
    const orderUpdates = {
      status: newStatus,
      updatedAt: timestamp,
      [`statusHistory/${orderData.statusHistory ? orderData.statusHistory.length : 0}`]: statusEntry
    };

    // No need to update the user's order reference since it only contains the order ID
    // The detailed order information is only stored in the orders collection

    // Only need to update the main order
    const updatePromises = [
      update(orderRef, orderUpdates)
    ];

    // Execute all updates
    await Promise.all(updatePromises)
      .then(() => {
        console.log('Order status updated successfully in all locations');
      })
      .catch((updateError) => {
        console.error('Error during order status update:', updateError);
        throw updateError;
      });

    return true;
  } catch (error: any) {
    console.error('Update order status error (RTDB):', error);
    console.error('Error details:', error.code, error.message);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

// Test Realtime Database connection and permissions
export const testRTDBConnection = async () => {
  if (!rtdb) {
    console.error('Firebase Realtime Database is not initialized');
    return {
      success: false,
      error: 'Firebase Realtime Database is not initialized'
    };
  }

  try {
    console.log('Testing Realtime Database connection...');

    // Try to write to a test location
    const testRef = ref(rtdb, 'connection-test');
    const timestamp = new Date().toISOString();

    await set(testRef, {
      timestamp,
      message: 'Connection test successful'
    });

    console.log('Successfully wrote to Realtime Database');

    // Try to read from the test location
    const snapshot = await get(testRef);

    if (snapshot.exists()) {
      console.log('Successfully read from Realtime Database:', snapshot.val());
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      console.error('Test location does not exist after writing');
      return {
        success: false,
        error: 'Test location does not exist after writing'
      };
    }
  } catch (error: any) {
    console.error('Realtime Database test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Get user role
export const getUserRole = async (userId: string): Promise<string> => {
  if (!rtdb || !userId) {
    return 'guest';
  }

  try {
    const userRef = ref(rtdb, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.role || 'user';
    }

    return 'guest';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'guest';
  }
};

// Check if a user is an admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (!rtdb || !userId) {
    return false;
  }

  try {
    // First check in the admins collection
    const adminRef = ref(rtdb, `admins/${userId}`);
    const adminSnapshot = await get(adminRef);

    if (adminSnapshot.exists()) {
      const adminData = adminSnapshot.val();
      return adminData.isAdmin === true;
    }

    // If not found in admins collection, check user role
    const userRole = await getUserRole(userId);
    return userRole === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get user data
export const getUserData = async (userId: string): Promise<any | null> => {
  if (!rtdb || !userId) {
    return null;
  }

  try {
    const userRef = ref(rtdb, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Create a new admin user
export const createAdminUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // Register the user with admin role
    const user = await registerUser(email, password, 'admin');

    console.log(`Admin user created: ${user.uid}`);
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
};

// Export auth, db, and rtdb, which might be undefined if Firebase initialization failed
export { auth, db, rtdb };
