const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// wait, node 18+ has fetch built-in.
async function run() {
  try {
    const resReg = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test12345@example.com', password: 'password123', name: 'Test User' })
    });
    const dataReg = await resReg.json();
    console.log('Register:', dataReg);

    if (!dataReg.token) {
      console.log('No token from register, maybe user exists. Attempting login...');
      const resLog = await globalThis.fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test12345@example.com', password: 'password123' })
      });
      const dataLog = await resLog.json();
      console.log('Login:', dataLog);
      var token = dataLog.token;
    } else {
      var token = dataReg.token;
    }

    const resJob = await globalThis.fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ company: 'Google', position: 'SWE', date_applied: '2023-01-01' })
    });
    const dataJob = await resJob.json();
    console.log('Create Job:', dataJob);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
