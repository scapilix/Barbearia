import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1610992015732-2449b76344bc',
  'https://images.unsplash.com/photo-1628035514995-0370607ba919',
  'https://images.unsplash.com/photo-1604654894610-df490651e123',
  'https://images.unsplash.com/photo-1519415510236-8559b19b082e',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b',
  'https://images.unsplash.com/photo-1632345031435-07ca6838380f',
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66',
  'https://images.unsplash.com/photo-1522337360788-8b13df772ec2',
  'https://images.unsplash.com/photo-1559599189-fe84dea4eb79',
  'https://images.unsplash.com/photo-1629191062061-f3b17942709a',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url + '?q=80&w=100', { method: 'HEAD' }, (res) => {
      resolve(`${url} -> ${res.statusCode}`);
    }).on('error', (err) => resolve(`${url} -> ERROR ${err.message}`)).end();
  });
}

async function run() {
  for (const url of urls) {
    console.log(await checkUrl(url));
  }
}

run();
