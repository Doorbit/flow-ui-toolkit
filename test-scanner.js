// Test script to verify Scanner component implementation
const fs = require('fs');

// Create a new flow with a Scanner component
const createTestFlow = async () => {
  try {
    // Wait for the application to be ready
    console.log('Creating a test flow with a Scanner component...');
    
    // Create a new flow
    const flow = {
      id: 'test-scanner-flow',
      'url-key': 'test-scanner-flow',
      name: 'Test Scanner Flow',
      title: {
        de: 'Test Scanner Flow',
        en: 'Test Scanner Flow'
      },
      icon: 'mdiFileOutline',
      pages_edit: [
        {
          pattern_type: 'Page',
          id: 'page-1',
          title: {
            de: 'Scanner Test',
            en: 'Scanner Test'
          },
          elements: []
        }
      ],
      pages_view: []
    };
    
    // Save the flow to a file
    fs.writeFileSync('test-scanner-flow.json', JSON.stringify(flow, null, 2));
    console.log('Test flow created and saved to test-scanner-flow.json');
    
    console.log('Instructions:');
    console.log('1. Open the application in your browser');
    console.log('2. Click "Open" and select the test-scanner-flow.json file');
    console.log('3. Add a Scanner component to the page');
    console.log('4. Verify that the Scanner component includes all the required subflows');
    console.log('5. Save the flow to verify that the JSON structure is correct');
  } catch (error) {
    console.error('Error creating test flow:', error);
  }
};

createTestFlow();
