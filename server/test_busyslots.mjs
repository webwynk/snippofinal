import http from 'http';

http.get('http://localhost:4000/api/bootstrap', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('--- BUSY SLOTS from Local 4000 ---');
      console.log(parsed.busySlots);
    } catch (e) {
      console.error('Parse error:', e, data.substring(0, 100));
    }
  });
}).on('error', err => console.error(err));
