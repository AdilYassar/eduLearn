// Debug script to test Profile API
const BASE_URL = 'https://833fc9ec84c2.ngrok-free.app';

console.log('=== API TESTING DETAILS ===\n');

console.log('🌐 BASE URL:', BASE_URL);
console.log('🔗 API Endpoints to test:');
console.log('1. Student Profile:', `${BASE_URL}/api/user`);
console.log('2. Generic Profile:', `${BASE_URL}/api/user/profile`);
console.log('3. Enrollment Stats:', `${BASE_URL}/api/user/enrollment-stats`);

console.log('\n📋 Headers Required:');
console.log('Authorization: Bearer <YOUR_ACCESS_TOKEN>');
console.log('Content-Type: application/json');
console.log('ngrok-skip-browser-warning: true');

console.log('\n🔑 To get your current access token:');
console.log('1. Open React Native Debugger or Metro logs');
console.log('2. Look for the logged access token in the logs');
console.log('3. OR check AsyncStorage for "accessToken" key');

console.log('\n📝 Expected Response Structure:');
console.log('For /api/user:');
console.log(`{
  "message": "Student fetched successfully",
  "student": {
    "uuid": "...",
    "name": "...",
    "email": "...",
    "role": "Student",
    "enrolledCourses": [...],
    "quizPerformance": [...],
    ...
  }
}`);

console.log('\nFor /api/user/profile:');
console.log(`{
  "message": "User fetched successfully", 
  "user": {
    "uuid": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    ...
  }
}`);

console.log('\n🔧 Postman Testing Steps:');
console.log('1. Method: GET');
console.log('2. URL: Choose one of the endpoints above');
console.log('3. Headers:');
console.log('   - Authorization: Bearer YOUR_ACCESS_TOKEN');
console.log('   - ngrok-skip-browser-warning: true');
console.log('4. Send request and check response');

console.log('\n⚠️  Common Issues:');
console.log('- Token expired (check expiry)');
console.log('- Wrong endpoint URL');
console.log('- Missing ngrok-skip-browser-warning header');
console.log('- Server not running');
