/**
 * Comprehensive DSS Testing Script
 * Tests vendor ID formats, DSS field population, and matching algorithm accuracy
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + '═'.repeat(70));
  console.log(colorize(title, 'bright'));
  console.log('═'.repeat(70));
}

function printSection(title) {
  console.log('\n' + colorize(title, 'cyan'));
  console.log('─'.repeat(70));
}

// Test 1: Vendor ID Format Analysis
async function testVendorIDFormats() {
  printHeader('📋 TEST 1: VENDOR ID FORMAT ANALYSIS');
  
  try {
    // Get all unique vendor IDs from services
    const services = await sql`SELECT DISTINCT vendor_id FROM services ORDER BY vendor_id`;
    const vendorIds = services.map(s => s.vendor_id);
    
    console.log(`Total unique vendor IDs: ${vendorIds.length}`);
    
    // Categorize by format
    const venFormat = vendorIds.filter(id => id.startsWith('VEN-'));
    const twoFormat = vendorIds.filter(id => id.startsWith('2-'));
    const otherFormat = vendorIds.filter(id => !id.startsWith('VEN-') && !id.startsWith('2-'));
    
    printSection('Format Distribution:');
    console.log(`  ${colorize('VEN-xxxxx', 'green')} format: ${venFormat.length} (${(venFormat.length / vendorIds.length * 100).toFixed(1)}%)`);
    console.log(`  ${colorize('2-yyyy-xxx', 'yellow')} format: ${twoFormat.length} (${(twoFormat.length / vendorIds.length * 100).toFixed(1)}%)`);
    console.log(`  ${colorize('Other', 'red')} formats: ${otherFormat.length} (${(otherFormat.length / vendorIds.length * 100).toFixed(1)}%)`);
    
    printSection('Sample IDs by Format:');
    console.log(`  VEN format: ${venFormat.slice(0, 5).join(', ')}`);
    console.log(`  2- format: ${twoFormat.slice(0, 5).join(', ') || 'None'}`);
    console.log(`  Other: ${otherFormat.slice(0, 5).join(', ') || 'None'}`);
    
    // Check if vendors exist in vendors table
    printSection('Vendor Table Cross-Reference:');
    const vendorsInTable = await sql`SELECT id FROM vendors WHERE id = ANY(${vendorIds})`;
    console.log(`  Vendors found in vendors table: ${vendorsInTable.length}/${vendorIds.length}`);
    
    const missingVendors = vendorIds.filter(id => !vendorsInTable.find(v => v.id === id));
    if (missingVendors.length > 0) {
      console.log(`  ${colorize('⚠️  Missing vendors:', 'yellow')} ${missingVendors.join(', ')}`);
    }
    
    return {
      success: true,
      totalIds: vendorIds.length,
      venFormat: venFormat.length,
      twoFormat: twoFormat.length,
      missingVendors: missingVendors.length
    };
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: DSS Field Population Status
async function testDSSPopulation() {
  printHeader('📊 TEST 2: DSS FIELD POPULATION STATUS');
  
  try {
    const services = await sql`
      SELECT 
        id, title, category, vendor_id,
        service_tier, wedding_styles, cultural_specialties,
        years_in_business, location_data, availability
      FROM services
      WHERE is_active = true
    `;
    
    console.log(`Total active services: ${services.length}`);
    
    // Count populated fields
    const fieldStats = {
      service_tier: services.filter(s => s.service_tier).length,
      wedding_styles: services.filter(s => s.wedding_styles && (Array.isArray(s.wedding_styles) ? s.wedding_styles.length > 0 : Object.keys(s.wedding_styles).length > 0)).length,
      cultural_specialties: services.filter(s => s.cultural_specialties && (Array.isArray(s.cultural_specialties) ? s.cultural_specialties.length > 0 : Object.keys(s.cultural_specialties).length > 0)).length,
      years_in_business: services.filter(s => s.years_in_business !== null && s.years_in_business !== undefined).length,
      location_data: services.filter(s => s.location_data && (Array.isArray(s.location_data) ? s.location_data.length > 0 : Object.keys(s.location_data).length > 0)).length,
      availability: services.filter(s => s.availability && (Array.isArray(s.availability) ? s.availability.length > 0 : Object.keys(s.availability).length > 0)).length
    };
    
    printSection('Field Population Rates:');
    Object.entries(fieldStats).forEach(([field, count]) => {
      const percentage = (count / services.length * 100).toFixed(1);
      const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red';
      console.log(`  ${field.padEnd(25)}: ${colorize(`${count}/${services.length}`, color)} (${percentage}%)`);
    });
    
    // Category breakdown
    printSection('Population by Category:');
    const categories = [...new Set(services.map(s => s.category))];
    categories.forEach(category => {
      const categoryServices = services.filter(s => s.category === category);
      const withTier = categoryServices.filter(s => s.service_tier).length;
      const percentage = (withTier / categoryServices.length * 100).toFixed(0);
      console.log(`  ${category.padEnd(20)}: ${withTier}/${categoryServices.length} (${percentage}%)`);
    });
    
    // Sample service with DSS data
    const sampleWithData = services.find(s => s.service_tier && s.wedding_styles);
    if (sampleWithData) {
      printSection('Sample Service with DSS Data:');
      console.log(`  ID: ${sampleWithData.id}`);
      console.log(`  Title: ${sampleWithData.title}`);
      console.log(`  Tier: ${sampleWithData.service_tier || 'N/A'}`);
      console.log(`  Styles: ${JSON.stringify(sampleWithData.wedding_styles) || 'N/A'}`);
      console.log(`  Years: ${sampleWithData.years_in_business || 'N/A'}`);
    }
    
    // Overall score
    const totalFields = Object.values(fieldStats).reduce((a, b) => a + b, 0);
    const maxPossible = services.length * Object.keys(fieldStats).length;
    const overallScore = (totalFields / maxPossible * 100).toFixed(1);
    
    printSection('Overall DSS Score:');
    const scoreColor = overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red';
    console.log(`  ${colorize(`${overallScore}%`, scoreColor)} of DSS fields are populated`);
    
    return {
      success: true,
      totalServices: services.length,
      fieldStats,
      overallScore: parseFloat(overallScore)
    };
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Matching Algorithm Accuracy
async function testMatchingAlgorithm() {
  printHeader('🎯 TEST 3: MATCHING ALGORITHM SIMULATION');
  
  try {
    // Get sample services with DSS data
    const services = await sql`
      SELECT 
        id, title, category, vendor_id, price, price_range,
        service_tier, wedding_styles, cultural_specialties,
        years_in_business, location_data, availability
      FROM services
      WHERE is_active = true
      AND service_tier IS NOT NULL
      LIMIT 20
    `;
    
    console.log(`Testing with ${services.length} services that have DSS data`);
    
    // Test scenarios
    const testScenarios = [
      {
        name: 'Complete Preferences',
        preferences: {
          budget: 50000,
          style: 'modern',
          culturalPreference: 'Filipino',
          location: 'Manila'
        }
      },
      {
        name: 'Partial Preferences (Budget + Style only)',
        preferences: {
          budget: 30000,
          style: 'rustic'
        }
      },
      {
        name: 'Minimal Preferences (Budget only)',
        preferences: {
          budget: 100000
        }
      }
    ];
    
    testScenarios.forEach(scenario => {
      printSection(`Scenario: ${scenario.name}`);
      console.log(`  Preferences: ${JSON.stringify(scenario.preferences, null, 2)}`);
      
      // Simulate matching
      const scores = services.map(service => {
        let score = 0;
        let maxScore = 0;
        
        // Budget match (if preference exists)
        if (scenario.preferences.budget) {
          maxScore += 30;
          const servicePrice = parseFloat(service.price) || 0;
          if (servicePrice > 0) {
            const priceDiff = Math.abs(servicePrice - scenario.preferences.budget) / scenario.preferences.budget;
            score += Math.max(0, 30 * (1 - priceDiff));
          }
        }
        
        // Style match (if both exist)
        if (scenario.preferences.style && service.wedding_styles) {
          maxScore += 25;
          const styles = Array.isArray(service.wedding_styles) 
            ? service.wedding_styles 
            : Object.values(service.wedding_styles);
          if (styles.includes(scenario.preferences.style)) {
            score += 25;
          }
        }
        
        // Cultural match (if both exist)
        if (scenario.preferences.culturalPreference && service.cultural_specialties) {
          maxScore += 20;
          const culturals = Array.isArray(service.cultural_specialties)
            ? service.cultural_specialties
            : Object.values(service.cultural_specialties);
          if (culturals.includes(scenario.preferences.culturalPreference)) {
            score += 20;
          }
        }
        
        // Experience bonus (always applicable)
        maxScore += 15;
        if (service.years_in_business) {
          score += Math.min(15, service.years_in_business * 3);
        }
        
        // Data completeness bonus (always applicable)
        maxScore += 10;
        const fieldsPresent = [
          service.service_tier,
          service.wedding_styles,
          service.cultural_specialties,
          service.years_in_business,
          service.availability
        ].filter(Boolean).length;
        score += (fieldsPresent / 5) * 10;
        
        const finalScore = maxScore > 0 ? (score / maxScore * 100) : 0;
        
        return {
          service: service.title,
          category: service.category,
          score: finalScore.toFixed(1),
          rawScore: score.toFixed(1),
          maxScore: maxScore.toFixed(1)
        };
      });
      
      // Sort by score and show top 5
      scores.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
      console.log('\n  Top 5 Matches:');
      scores.slice(0, 5).forEach((match, i) => {
        const color = parseFloat(match.score) >= 70 ? 'green' : 
                     parseFloat(match.score) >= 50 ? 'yellow' : 'red';
        console.log(`    ${i + 1}. ${match.service.padEnd(40)} ${colorize(`${match.score}%`, color)} (${match.rawScore}/${match.maxScore})`);
      });
      
      // Statistics
      const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length;
      const minScore = Math.min(...scores.map(s => parseFloat(s.score)));
      const maxScore = Math.max(...scores.map(s => parseFloat(s.score)));
      
      console.log(`\n  Score Statistics:`);
      console.log(`    Average: ${avgScore.toFixed(1)}%`);
      console.log(`    Range: ${minScore.toFixed(1)}% - ${maxScore.toFixed(1)}%`);
    });
    
    return { success: true };
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), error.message);
    return { success: false, error: error.message };
  }
}

// Test 4: Data Quality Check
async function testDataQuality() {
  printHeader('🔍 TEST 4: DATA QUALITY CHECK');
  
  try {
    const issues = [];
    
    // Check for missing critical fields
    printSection('Critical Field Analysis:');
    
    const missingPrice = await sql`SELECT COUNT(*) as count FROM services WHERE is_active = true AND (price IS NULL OR CAST(price AS TEXT) = '' OR CAST(price AS TEXT) = '0')`;
    console.log(`  Services missing price: ${colorize(missingPrice[0].count, missingPrice[0].count > 0 ? 'yellow' : 'green')}`);
    if (missingPrice[0].count > 0) issues.push(`${missingPrice[0].count} services missing price`);
    
    const missingCategory = await sql`SELECT COUNT(*) as count FROM services WHERE is_active = true AND category IS NULL`;
    console.log(`  Services missing category: ${colorize(missingCategory[0].count, missingCategory[0].count > 0 ? 'red' : 'green')}`);
    if (missingCategory[0].count > 0) issues.push(`${missingCategory[0].count} services missing category`);
    
    const missingTitle = await sql`SELECT COUNT(*) as count FROM services WHERE is_active = true AND (title IS NULL OR title = '')`;
    console.log(`  Services missing title: ${colorize(missingTitle[0].count, missingTitle[0].count > 0 ? 'red' : 'green')}`);
    if (missingTitle[0].count > 0) issues.push(`${missingTitle[0].count} services missing title`);
    
    // Check for orphaned services (vendor not in vendors table)
    printSection('Referential Integrity:');
    const orphaned = await sql`
      SELECT s.id, s.title, s.vendor_id 
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true AND v.id IS NULL
      LIMIT 5
    `;
    console.log(`  Orphaned services (vendor not found): ${colorize(orphaned.length, orphaned.length > 0 ? 'yellow' : 'green')}`);
    if (orphaned.length > 0) {
      orphaned.forEach(o => {
        console.log(`    - ${o.title} (vendor: ${o.vendor_id})`);
      });
      issues.push(`${orphaned.length} orphaned services`);
    }
    
    // Summary
    printSection('Data Quality Summary:');
    if (issues.length === 0) {
      console.log(colorize('  ✅ All data quality checks passed!', 'green'));
    } else {
      console.log(colorize(`  ⚠️  Found ${issues.length} issue(s):`, 'yellow'));
      issues.forEach(issue => console.log(`    - ${issue}`));
    }
    
    return { success: true, issues };
  } catch (error) {
    console.error(colorize('❌ Error:', 'red'), error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
async function runAllTests() {
  console.log(colorize('\n🚀 COMPREHENSIVE DSS TESTING SUITE', 'bright'));
  console.log(colorize('   Wedding Bazaar - Intelligent Wedding Planner', 'cyan'));
  console.log(colorize(`   ${new Date().toLocaleString()}`, 'magenta'));
  
  const results = {};
  
  results.vendorIds = await testVendorIDFormats();
  results.dssPopulation = await testDSSPopulation();
  results.matching = await testMatchingAlgorithm();
  results.dataQuality = await testDataQuality();
  
  // Final summary
  printHeader('📊 FINAL SUMMARY');
  
  const allPassed = Object.values(results).every(r => r.success !== false);
  
  if (allPassed) {
    console.log(colorize('\n✅ All tests completed successfully!', 'green'));
    
    if (results.dssPopulation?.overallScore < 80) {
      console.log(colorize('\n⚠️  RECOMMENDATION:', 'yellow'));
      console.log('   DSS field population is below 80%.');
      console.log('   Run: node populate-dss-fields.cjs');
    }
    
    if (results.dataQuality?.issues?.length > 0) {
      console.log(colorize('\n⚠️  DATA QUALITY ISSUES:', 'yellow'));
      console.log('   Some data quality issues were found.');
      console.log('   Review the Data Quality Check section above.');
    }
  } else {
    console.log(colorize('\n❌ Some tests failed!', 'red'));
    console.log('   Review the error messages above.');
  }
  
  console.log('\n' + '═'.repeat(70) + '\n');
}

// Run tests
runAllTests().catch(error => {
  console.error(colorize('Fatal error:', 'red'), error);
  process.exit(1);
});
