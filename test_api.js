fetch('http://127.0.0.1:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'testfetch@example.com', password: 'password123'})
}).then(async r => {
  console.log('Status:', r.status);
  const text = await r.text();
  console.log('Body:', text);
}).catch(console.error);
