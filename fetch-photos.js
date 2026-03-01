import https from 'https';

async function fetchUnsplash(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=[a-zA-Z0-9-]+&ixlib=[a-zA-Z0-9-]+&q=80&w=1080/g)];
        const simplified = matches.map(m => m[0].split('?')[0] + '?q=80&w=900&auto=format&fit=crop');
        resolve([...new Set(simplified)].slice(0, 15));
      });
    }).on('error', reject);
  });
}

async function run() {
  const manicure = await fetchUnsplash('manicure');
  const salon = await fetchUnsplash('nail-salon');
  const luxury = await fetchUnsplash('luxury-spa');
  
  console.log("--- MANICURE ---");
  console.log(manicure.join('\n'));
  console.log("\n--- NAIL SALON ---");
  console.log(salon.join('\n'));
  console.log("\n--- LUXURY SPA ---");
  console.log(luxury.join('\n'));
}

run();
