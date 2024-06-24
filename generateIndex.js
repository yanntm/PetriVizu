const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, 'examples');
const outputDir = path.join(__dirname, 'website', 'examples');
const outputFile = path.join(outputDir, 'index.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(examplesDir, (err, files) => {
  if (err) {
    console.error('Error reading examples directory:', err);
    process.exit(1);
  }

  const pnmlFiles = files.filter(file => file.endsWith('.pnml'));
  fs.writeFileSync(outputFile, JSON.stringify(pnmlFiles, null, 2));
  console.log('index.json generated successfully.');
});
