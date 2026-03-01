import https from 'https';

const pexelsUrls = [
  'https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/8533031/pexels-photo-8533031.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/704813/pexels-photo-704813.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3997380/pexels-photo-3997380.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/10214227/pexels-photo-10214227.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1049317/pexels-photo-1049317.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4141673/pexels-photo-4141673.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1321453/pexels-photo-1321453.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/957816/pexels-photo-957816.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6535698/pexels-photo-6535698.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7691166/pexels-photo-7691166.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8815152/pexels-photo-8815152.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4612170/pexels-photo-4612170.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3807759/pexels-photo-3807759.jpeg?auto=compress&cs=tinysrgb&w=150'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(`${url} -> ${res.statusCode}`);
    }).on('error', (err) => resolve(`${url} -> ERROR ${err.message}`)).end();
  });
}

async function run() {
  for (const url of pexelsUrls) {
    console.log(await checkUrl(url));
  }
}

run();
