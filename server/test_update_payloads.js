async function test() {
  const email = 'user_test_update_' + Date.now() + '@example.com';
  console.log('Testing with email:', email);
  
  const regRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', name: 'Tester' })
  });
  const { token } = await regRes.json();

  const jobRes = await fetch('http://localhost:5001/api/jobs', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ company: 'TestCo', position: 'SWE', date_applied: '2023-10-10' })
  });
  const job = await jobRes.json();
  const jobId = job.id;

  console.log('\n--- Test 3: Multiple/Malformed questions ---');
  const upRes = await fetch('http://localhost:5001/api/jobs/' + jobId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ 
      company: 'TestCo', position: 'SWE', date_applied: '2023-10-10',
      interview_questions: [
        { round: 'Tech', question: 'What is React?', answer: 'Library' },
        null,
        { question: 'What is Node?' }
      ]
    })
  });
  console.log('Status:', upRes.status);
  const text = await upRes.text();
  console.log('Response:', text);
}
test().catch(console.error);
