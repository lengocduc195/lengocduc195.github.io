// Script to create an admin user
// Run with: node scripts/create-admin.js <email> <password>

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set, serverTimestamp } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYrcJmNxJCuUTVn3mTM-8dT-dwQyxUGMM",
  authDomain: "shopbazano.firebaseapp.com",
  databaseURL: "https://shopbazano-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shopbazano",
  storageBucket: "shopbazano.appspot.com",
  messagingSenderId: "1098026719578",
  appId: "1:1098026719578:web:b0e54bd6f4a5c8d0e88b9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function createAdminUser(email, password) {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(`User created with UID: ${user.uid}`);

    // Set user data with admin role
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      email: user.email,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    // Also set admin flag in the admins collection for backward compatibility
    const adminRef = ref(db, `admins/${user.uid}`);
    await set(adminRef, {
      email: user.email,
      isAdmin: true,
      createdAt: new Date().toISOString()
    });

    console.log(`Admin privileges granted to ${email}`);
    console.log('Admin user created successfully!');

    return user;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    throw error;
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

// Create admin user
createAdminUser(email, password)
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
