const fs = require('fs');
const path = require('path');

const files = [
  'database_schema.sql',
  'populate_full_data.sql',
  'create_service_links.sql',
  'create_faturas_table.sql',
  'create_team_and_settings.sql'
];

const replacements = {
  'Letícia Silva': 'William',
  'Leticia Silva': 'William',
  'Ana Santos': 'Rodrigo',
  'Carla Mendes': 'Francisco',
  'Rita Almeida': 'Francisco',
  'TO Beauty': 'TO Barber',
  'info@tobeauty.pt': 'info@tobarber.pt',
  'Nail Designer Sénior': 'Mestre Barbeiro',
  'Esteticista': 'Barbeiro Sênior',
  'Nail Designer': 'Barbeiro',
  'Manicure Clássica': 'Corte Clássico',
  'Manicure Gel': 'Corte Clássico',
  'Manicure Russa': 'Corte Degradê / Fade',
  'Pedicure Spa': 'Barba com Toalha Quente',
  'Pedicure Gel': 'Corte + Barba',
  'Nail Art Premium': 'Corte Fade + Barba',
  'Nail Art Simples': 'Barba Simples',
  'Alongamento Acrílico': 'Corte Criança',
  'Alongamento Gel': 'Platinado / Madeixas',
  'Manutenção Gel': 'Corte à Máquina',
  'Remoção de Gel': 'Lavagem VIP',
  'Verniz Gel Premium': 'Sobrancelha',
  'Unhas': 'Cabelo'
};

files.forEach(fileName => {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [search, replace] of Object.entries(replacements)) {
    // Escape special characters for regex
    const regex = new RegExp(search, 'g');
    content = content.replace(regex, replace);
  }
  
  // Specific case insensitivity for 'manicure gel - maria', etc. in bookings notes
  content = content.replace(/Manicure gel/g, 'Corte clássico');
  content = content.replace(/Nail art premium/g, 'Corte Fade + Barba');
  content = content.replace(/Alongamento gel/g, 'Platinado');
  content = content.replace(/Manicure russa/g, 'Fade');
  content = content.replace(/Pedicure spa/g, 'Barba toalha quente');
  content = content.replace(/Verniz gel premium/g, 'Sobrancelha');
  content = content.replace(/Nail art simples/g, 'Barba simples');
  content = content.replace(/Pedicure gel/g, 'Corte e barba');
  content = content.replace(/Alongamento acrílico/g, 'Corte Criança');
  content = content.replace(/Manutenção gel/g, 'Máquina');
  content = content.replace(/Remoção de gel/g, 'Lavagem VIP');
  content = content.replace(/Manicure clássica/g, 'Corte clássico');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("SQL Replacement complete!");
