async function test() {
  const host = 'ep-small-mud-aopx0eza.ap-southeast-1.neon.tech';
  const url = `https://${host}/sql`;
  const token = 'npg_KzaE9MTihP0g'; // from the password in the connection string
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'SELECT id, title, slug, status FROM blogs',
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('Blogs in database:', data);
    } else {
      console.error('Fetch failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
