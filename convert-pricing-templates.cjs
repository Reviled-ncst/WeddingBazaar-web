/**
 * Script to convert pricing templates from string[] to PackageInclusion[]
 * This adds quantity, unit, and unit_price to each inclusion
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/users/vendor/services/components/pricing/categoryPricingTemplates.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Unit mapping based on common patterns
const getUnitAndPrice = (inclusion) => {
  const lower = inclusion.toLowerCase();
  
  // Hours
  if (lower.includes(' hour') || lower.match(/\d+\s*hours?/)) {
    const match = lower.match(/(\d+)\s*hours?/);
    const hours = match ? parseInt(match[1]) : 1;
    return { unit: 'hours', quantity: hours, unit_price: 5000 };
  }
  
  // Photos
  if (lower.includes('photo') || lower.includes('picture')) {
    const match = lower.match(/(\d+)\s*(edited\s*)?photos?/);
    const photos = match ? parseInt(match[1]) : 100;
    return { unit: 'photos', quantity: photos, unit_price: 50 };
  }
  
  // People/persons
  if (lower.match(/\d+\s*(photographer|videographer|coordinator|assistant|person|people)/)) {
    const match = lower.match(/(\d+)\s*(photographer|videographer|coordinator|assistant|person|people)/);
    const count = match ? parseInt(match[1]) : 1;
    return { unit: 'persons', quantity: count, unit_price: 10000 };
  }
  
  // Albums
  if (lower.includes('album')) {
    return { unit: 'album', quantity: 1, unit_price: 10000 };
  }
  
  // Videos
  if (lower.includes('video')) {
    return { unit: 'video', quantity: 1, unit_price: 10000 };
  }
  
  // Sessions (shoots, consultations)
  if (lower.includes('shoot') || lower.includes('session') || lower.includes('consultation')) {
    const match = lower.match(/(\d+)\s*(shoots?|sessions?|consultations?)/);
    const count = match ? parseInt(match[1]) : 1;
    return { unit: 'sessions', quantity: count, unit_price: 8000 };
  }
  
  // Meals/pax
  if (lower.includes('meal') || lower.includes('guest') || lower.includes('pax')) {
    return { unit: 'pax', quantity: 100, unit_price: 800 };
  }
  
  // Sets
  if (lower.includes('set') || lower.includes('course')) {
    return { unit: 'sets', quantity: 1, unit_price: 5000 };
  }
  
  // Days
  if (lower.match(/\d+\s*days?/)) {
    const match = lower.match(/(\d+)\s*days?/);
    const days = match ? parseInt(match[1]) : 1;
    return { unit: 'days', quantity: days, unit_price: 10000 };
  }
  
  // Default: service or item
  if (lower.includes('service') || lower.includes('access') || lower.includes('support')) {
    return { unit: 'service', quantity: 1, unit_price: 5000 };
  }
  
  // Fallback
  return { unit: 'items', quantity: 1, unit_price: 3000 };
};

// Function to convert a string inclusion to PackageInclusion object
const convertInclusion = (inclusion) => {
  const { unit, quantity, unit_price } = getUnitAndPrice(inclusion);
  
  // Clean the name (remove quantity mentions if they're at the start)
  let name = inclusion
    .replace(/^\d+\s*(hours?|photos?|photographers?|videographers?)\s*/i, '')
    .replace(/^\d+\s*/, '');
  
  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Generate a description
  const description = name.length > 50 ? '' : `Professional ${name.toLowerCase()}`;
  
  return {
    name,
    quantity,
    unit,
    unit_price,
    description: description || ''
  };
};

// Regex to find inclusion arrays (strings between square brackets)
const inclusionArrayRegex = /inclusions:\s*\[([\s\S]*?)\]/g;

let match;
let replacements = [];

while ((match = inclusionArrayRegex.exec(content)) !== null) {
  const fullMatch = match[0];
  const inclusionsContent = match[1];
  
  // Skip if already converted (contains 'name:', 'quantity:', etc.)
  if (inclusionsContent.includes('name:') || inclusionsContent.includes('quantity:')) {
    continue;
  }
  
  // Extract string inclusions
  const stringRegex = /'([^']+)'/g;
  const inclusions = [];
  let stringMatch;
  
  while ((stringMatch = stringRegex.exec(inclusionsContent)) !== null) {
    inclusions.push(stringMatch[1]);
  }
  
  if (inclusions.length === 0) continue;
  
  // Convert to PackageInclusion format
  const converted = inclusions.map(convertInclusion);
  
  // Build the new inclusions array string
  const newInclusions = converted.map(inc => 
    `        { name: '${inc.name}', quantity: ${inc.quantity}, unit: '${inc.unit}', unit_price: ${inc.unit_price}, description: '${inc.description}' }`
  ).join(',\n');
  
  const newContent = `inclusions: [\n${newInclusions}\n      ]`;
  
  replacements.push({
    old: fullMatch,
    new: newContent
  });
}

// Apply all replacements
let newContent = content;
replacements.forEach(({ old, new: newText }) => {
  newContent = newContent.replace(old, newText);
});

// Add tier property to each package if missing
newContent = newContent.replace(
  /item_name: '([^']+)',\s*description: '([^']+)',\s*price: (\d+),\s*inclusions:/g,
  (match, name, desc, price) => {
    // Determine tier based on price and name
    let tier = 'standard';
    const nameLower = name.toLowerCase();
    const priceNum = parseInt(price);
    
    if (nameLower.includes('basic') || nameLower.includes('essential') || priceNum < 40000) {
      tier = 'basic';
    } else if (nameLower.includes('premium') || nameLower.includes('platinum') || nameLower.includes('luxury') || priceNum > 100000) {
      tier = 'premium';
    }
    
    return `item_name: '${name}',\n      description: '${desc}',\n      price: ${price},\n      tier: '${tier}',\n      inclusions:`;
  }
);

// Write back to file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ Successfully converted pricing templates!');
console.log(`📝 Total conversions: ${replacements.length}`);
console.log('🎯 File updated: categoryPricingTemplates.ts');
