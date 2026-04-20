fetch('http://127.0.0.1/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({ email: 'admin@starsim.io', password: 'admin123' })
}).then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  return res.text();
}).then(text => console.log('Body:', text))
  .catch(err => console.error('Error:', err));
