'use client';

import { useState, useEffect } from 'react';
import { testRTDBConnection, createOrderRTDB } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TestRTDBPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const { currentUser } = useAuth();

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testRTDBConnection();
      setTestResult(result);
      console.log('Connection test result:', result);
    } catch (error) {
      console.error('Error running connection test:', error);
      setTestResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
    if (!currentUser) {
      setOrderResult({ success: false, error: 'User not logged in' });
      return;
    }

    setOrderLoading(true);
    try {
      // Create a test order
      const testOrderData = {
        orderId: `test-order-${Date.now()}`,
        items: [
          {
            id: 'test-product-1',
            name: 'Test Product',
            price: 100000,
            quantity: 1,
            subtotal: 100000,
            image: '/assets/images/products/product-1.jpg',
          },
        ],
        subtotal: 100000,
        shippingCost: 15000,
        total: 115000,
        customerInfo: {
          name: 'Test User',
          email: currentUser.email || 'test@example.com',
          phone: '0123456789',
          address: 'Test Address',
        },
        paymentMethod: 'COD',
        shippingMethod: 'standard',
        notes: 'This is a test order',
        orderDate: new Date().toISOString(),
      };

      const orderId = await createOrderRTDB(currentUser.uid, testOrderData);
      setOrderResult({ success: true, orderId });
      console.log('Test order created with ID:', orderId);
    } catch (error) {
      console.error('Error creating test order:', error);
      setOrderResult({ success: false, error: String(error) });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Realtime Database Test</h1>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
        <button
          onClick={runConnectionTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        {testResult && (
          <div className="mt-4">
            <h3 className="font-semibold">Result:</h3>
            <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Test Order</h2>
        {!currentUser ? (
          <p className="text-red-500">You need to be logged in to create a test order.</p>
        ) : (
          <>
            <button
              onClick={createTestOrder}
              disabled={orderLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {orderLoading ? 'Creating...' : 'Create Test Order'}
            </button>

            {orderResult && (
              <div className="mt-4">
                <h3 className="font-semibold">Result:</h3>
                <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-auto">
                  {JSON.stringify(orderResult, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Firebase Rules</h2>
        <p className="mb-2">
          If you're having issues with permissions, make sure your Firebase Realtime Database rules are set correctly:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-auto">
{`{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`}
        </pre>
        <p className="mt-4">
          For testing purposes, you can temporarily set the rules to allow all access (not recommended for production):
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-auto">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
        </pre>
      </div>
    </div>
  );
}
