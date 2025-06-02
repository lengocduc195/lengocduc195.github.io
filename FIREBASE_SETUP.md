# Firebase Setup Instructions (Simplified)

This document provides basic instructions on how to set up Firebase for the authentication and order notification system.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name and follow the prompts to create the project

## Step 2: Enable Authentication

1. In the Firebase Console, go to your project
2. Click on "Authentication" in the left sidebar
3. Click on the "Get started" button
4. Enable the "Email/Password" sign-in method

## Step 3: Set Up Realtime Database

1. In the Firebase Console, go to your project
2. Click on "Realtime Database" in the left sidebar
3. Click on the "Create database" button
4. Choose "Start in production mode" and select a location close to your users
5. After creation, note the database URL (it will look like `https://your-project-id-default-rtdb.region.firebasedatabase.app`)
6. Set up the following data structure:
   - `users/{userId}` - To store user profile information
   - `orders/{orderId}` - To store order information
   - `notifications/{notificationId}` - To store order notifications

Note: The Realtime Database URL is required for your application to connect to the database. You'll need to add this URL to your environment variables in Step 6.

## Step 4: Set Up Firestore Database (for backward compatibility)

1. In the Firebase Console, go to your project
2. Click on "Firestore Database" in the left sidebar
3. Click on the "Create database" button
4. Choose "Start in production mode" and select a location close to your users
5. Create the following collections:
   - `users` - To store user profile information
   - `orders` - To store order information
   - `notifications` - To store order notifications

## Step 5: Get Firebase Configuration

1. In the Firebase Console, go to your project
2. Click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
3. Scroll down to the "Your apps" section
4. If you haven't added a web app yet, click on the web icon (</>) to add one
5. Register your app with a nickname
6. Copy the Firebase configuration object

## Step 6: Configure Your Application

1. Create a `.env.local` file in the root of your project (copy from `.env.local.example`)
2. Add your Firebase configuration values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-project-id-default-rtdb.region.firebasedatabase.app
   ```

   Note: The `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is essential for connecting to the Realtime Database. You can find this URL in the Realtime Database section of your Firebase Console.
3. Restart your development server

## Step 7: Test the Authentication and Order System

1. Register a new user account
2. Place a test order
3. Check the Realtime Database to see the user profile, order, and notification data
4. Also check the Firestore database to verify the data is duplicated for backward compatibility

## Note on Email Notifications

This simplified implementation stores order notifications in both Realtime Database and Firestore. To actually send emails, you would need to:

1. Set up an email service (like SendGrid, Mailgun, or Amazon SES)
2. Create a Firebase Cloud Function to send emails when new notifications are created
3. Or use a third-party service to monitor your Realtime Database and trigger emails

For now, all order information is stored in both Realtime Database and Firestore and can be viewed in the Firebase Console.
