#!/usr/bin/env node

/**
 * Simple test script to demonstrate the Bookmark API functionality
 * This script shows how to interact with the API endpoints
 */

const http = require('http');
const querystring = require('querystring');

const API_BASE = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const response = await makeRequest('GET', '/health');
    console.log(`✅ Health Check: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(`❌ Health Check failed: ${error.message}`);
  }
  console.log('');
}

async function testCreateBookmark() {
  console.log('📝 Testing Create Bookmark...');
  try {
    const bookmarkData = {
      url: 'https://example.com',
      title: 'Example Website',
      description: 'A sample website for testing'
    };
    
    const response = await makeRequest('POST', '/api/bookmarks', bookmarkData);
    console.log(`✅ Create Bookmark: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data; // Return the created bookmark
  } catch (error) {
    console.log(`❌ Create Bookmark failed: ${error.message}`);
  }
  console.log('');
}

async function testGetAllBookmarks() {
  console.log('📋 Testing Get All Bookmarks...');
  try {
    const response = await makeRequest('GET', '/api/bookmarks');
    console.log(`✅ Get All Bookmarks: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data; // Return the bookmarks array
  } catch (error) {
    console.log(`❌ Get All Bookmarks failed: ${error.message}`);
  }
  console.log('');
}

async function testGetBookmarkById(id) {
  console.log(`🔍 Testing Get Bookmark by ID (${id})...`);
  try {
    const response = await makeRequest('GET', `/api/bookmarks/${id}`);
    console.log(`✅ Get Bookmark by ID: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    console.log(`❌ Get Bookmark by ID failed: ${error.message}`);
  }
  console.log('');
}

async function testUpdateBookmark(id) {
  console.log(`✏️ Testing Update Bookmark (${id})...`);
  try {
    const updateData = {
      url: 'https://updated-example.com',
      title: 'Updated Example Website',
      description: 'Updated description for testing'
    };
    
    const response = await makeRequest('PUT', `/api/bookmarks/${id}`, updateData);
    console.log(`✅ Update Bookmark: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    console.log(`❌ Update Bookmark failed: ${error.message}`);
  }
  console.log('');
}

async function testCloneBookmark(id) {
  console.log(`📋 Testing Clone Bookmark (${id})...`);
  try {
    const response = await makeRequest('POST', `/api/bookmarks/${id}/clone`);
    console.log(`✅ Clone Bookmark: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    console.log(`❌ Clone Bookmark failed: ${error.message}`);
  }
  console.log('');
}

async function testDeleteBookmark(id) {
  console.log(`🗑️ Testing Delete Bookmark (${id})...`);
  try {
    const response = await makeRequest('DELETE', `/api/bookmarks/${id}`);
    console.log(`✅ Delete Bookmark: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    console.log(`❌ Delete Bookmark failed: ${error.message}`);
  }
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Bookmark API Tests...');
  console.log('=====================================\n');
  
  // Test health check
  await testHealthCheck();
  
  // Test create bookmark
  const createdBookmark = await testCreateBookmark();
  if (!createdBookmark) {
    console.log('❌ Cannot continue tests without created bookmark');
    return;
  }
  
  // Test get all bookmarks
  await testGetAllBookmarks();
  
  // Test get bookmark by ID
  await testGetBookmarkById(createdBookmark.id);
  
  // Test update bookmark
  await testUpdateBookmark(createdBookmark.id);
  
  // Test clone bookmark
  const clonedBookmark = await testCloneBookmark(createdBookmark.id);
  
  // Test delete cloned bookmark
  if (clonedBookmark) {
    await testDeleteBookmark(clonedBookmark.id);
  }
  
  // Test delete original bookmark
  await testDeleteBookmark(createdBookmark.id);
  
  console.log('✅ All tests completed!');
}

// Run the tests
console.log('📖 Bookmark API Test Suite');
console.log('==========================\n');
console.log('This script demonstrates the Bookmark API endpoints.');
console.log('Make sure the backend server is running on localhost:3000\n');
console.log('To start the server:');
console.log('  docker-compose up -d');
console.log('  or');
console.log('  npm run dev (in server/backend directory)\n');

runTests().catch(console.error); 