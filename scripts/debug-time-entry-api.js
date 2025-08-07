#!/usr/bin/env node

import { OpenProjectClient } from '../dist/client/openproject-client.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenProjectClient({
  baseUrl: process.env.OPENPROJECT_BASE_URL,
  apiKey: process.env.OPENPROJECT_API_KEY
});

async function testTimeEntryCreation() {
  try {
    console.log('Testing time entry creation...');
    
    const timeEntryData = {
      hours: 'PT8H',
      spentOn: '2025-08-08',
      comment: 'Debug test time entry',
      _links: {
        project: { href: '/api/v3/projects/3' },
        activity: { href: '/api/v3/time_entries/activities/1' }
      }
    };
    
    console.log('Sending request with data:', JSON.stringify(timeEntryData, null, 2));
    
    // Make raw API call to see actual response
    const response = await client.axiosInstance.post('/time_entries', timeEntryData);
    console.log('Raw API response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTimeEntryCreation();