const apiUrl = 'https://api.example.com/your-post-endpoint';
const authToken = 'Bearer YOUR_AUTH_TOKEN_HERE';  // Replace with your actual token

// Function to send a POST request with the given payload
async function sendRequest(payload) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authToken,  // Add the token to the Authorization header
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data)}`);
    return response;
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

// Function to load payload from JSON file
async function loadPayload() {
  try {
    const response = await fetch('path/to/payload.json'); // Replace with the actual path
    const payload = await response.json();
    return payload;
  } catch (error) {
    console.error('Error loading payload: ', error.message);
  }
}

// Function to generate full paths of all fields (including nested ones)
function getFieldPaths(obj, parentPath = '') {
  let paths = [];
  
  for (let key in obj) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      paths = paths.concat(getFieldPaths(obj[key], currentPath));
    } else {
      paths.push(currentPath);
    }
  }
  
  return paths;
}

// Helper function to remove a field based on a path
function removeFieldByPath(payload, path) {
  const keys = path.split('.');
  let temp = payload;
  
  for (let i = 0; i < keys.length - 1; i++) {
    temp = temp[keys[i]];
  }
  
  delete temp[keys[keys.length - 1]];
}

// Function to test the payload with each field removed
async function testFieldsForRequired() {
  const fullPayload = await loadPayload();
  if (!fullPayload) return;

  // Get all field paths (including nested fields)
  const paths = getFieldPaths(fullPayload);
  
  // Test with full payload first
  console.log("Testing with full payload:");
  await sendRequest(fullPayload);

  // Loop through each field path and remove it from the payload
  for (let path of paths) {
    // Create a deep copy of the full payload
    const modifiedPayload = JSON.parse(JSON.stringify(fullPayload));
    
    // Remove the field using the full path
    removeFieldByPath(modifiedPayload, path);

    console.log(`\nTesting without field: '${path}'`);

    // Send the modified payload
    const response = await sendRequest(modifiedPayload);

    // Check if the response indicates the missing field
    if (response && response.status >= 400) {
      console.log(`The field '${path}' is likely required.`);
    } else {
      console.log(`The field '${path}' is optional.`);
    }
  }
}

// Run the test
testFieldsForRequired();
