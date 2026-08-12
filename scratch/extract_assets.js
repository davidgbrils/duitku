const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = path.join(__dirname, '../image/brand_duitku.png');
const outputDir = path.join(__dirname, '../public/images/brand');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function extract() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Image dimensions:', metadata.width, 'x', metadata.height);

  const crops = [
    {
      name: 'logo_light.png',
      region: { left: 160, top: 110, width: 710, height: 250 },
    },
    {
      name: 'logo_icon.png',
      region: { left: 165, top: 120, width: 205, height: 210 },
    },
    {
      name: 'logo_dark.png',
      region: { left: 22, top: 462, width: 618, height: 202 },
    },
    {
      name: 'app_icon_light.png',
      region: { left: 665, top: 480, width: 165, height: 165 },
    },
    {
      name: 'app_icon_dark.png',
      region: { left: 848, top: 480, width: 165, height: 165 },
    },
    {
      name: 'hero_mockup.png',
      region: { left: 22, top: 681, width: 485, height: 312 },
    },
    {
      name: 'paper_mockup.png',
      region: { left: 520, top: 681, width: 492, height: 312 },
    },
    {
      name: 'brand_identity_concept.png',
      region: { left: 1040, top: 450, width: 475, height: 545 },
    },
    {
      name: 'favicon_32.png',
      region: { left: 165, top: 120, width: 205, height: 210 },
      resize: { width: 32, height: 32 }
    },
    {
      name: 'favicon_192.png',
      region: { left: 165, top: 120, width: 205, height: 210 },
      resize: { width: 192, height: 192 }
    }
  ];

  for (const item of crops) {
    let pipeline = sharp(inputPath).extract(item.region);
    if (item.resize) {
      pipeline = pipeline.resize(item.resize.width, item.resize.height);
    }
    const dest = path.join(outputDir, item.name);
    await pipeline.toFile(dest);
    console.log('Saved:', item.name);
  }
}

extract().catch(console.error);
