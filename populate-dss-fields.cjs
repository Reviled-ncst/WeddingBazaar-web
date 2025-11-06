#!/usr/bin/env node

/**
 * 🎯 DSS Fields Population Script
 * 
 * Purpose: Populate empty DSS fields in services table with intelligent defaults
 * based on existing service data (category, description, price, rating)
 * 
 * Fields to populate:
 * - service_tier (basic/premium/luxury)
 * - wedding_styles (TEXT[])
 * - cultural_specialties (TEXT[])
 * - years_in_business (INTEGER)
 * - location_data (JSONB)
 * - availability (JSONB)
 * 
 * Date: January 6, 2025
 * Status: Ready for execution
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function populateDSSFields() {
  console.log('🚀 Starting DSS fields population...');
  console.log('📊 Database:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  try {
    // Step 1: Check current state
    console.log('\n📋 Step 1: Checking current state...');
    const emptyFields = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE service_tier IS NULL) as missing_tier,
        COUNT(*) FILTER (WHERE wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL) as missing_styles,
        COUNT(*) FILTER (WHERE cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL) as missing_cultures,
        COUNT(*) FILTER (WHERE years_in_business IS NULL) as missing_years,
        COUNT(*) FILTER (WHERE location_data IS NULL) as missing_location,
        COUNT(*) FILTER (WHERE availability IS NULL) as missing_availability,
        COUNT(*) as total_services
      FROM services
    `;
    
    console.log('Current state:');
    console.log(`  Total services: ${emptyFields[0].total_services}`);
    console.log(`  Missing service_tier: ${emptyFields[0].missing_tier}`);
    console.log(`  Missing wedding_styles: ${emptyFields[0].missing_styles}`);
    console.log(`  Missing cultural_specialties: ${emptyFields[0].missing_cultures}`);
    console.log(`  Missing years_in_business: ${emptyFields[0].missing_years}`);
    console.log(`  Missing location_data: ${emptyFields[0].missing_location}`);
    console.log(`  Missing availability: ${emptyFields[0].missing_availability}`);
    
    // Step 2: Populate service_tier
    console.log('\n💎 Step 2: Populating service_tier...');
    const tierUpdate = await sql`
      UPDATE services 
      SET service_tier = CASE
        WHEN base_price >= 150000 OR (featured = true AND vendor_rating >= 4.5) THEN 'luxury'
        WHEN base_price >= 80000 OR vendor_rating >= 4.0 THEN 'premium'
        ELSE 'basic'
      END
      WHERE service_tier IS NULL
      RETURNING id, title, service_tier, base_price, vendor_rating
    `;
    console.log(`✅ Updated ${tierUpdate.length} services with service_tier`);
    if (tierUpdate.length > 0) {
      console.log(`   Sample: "${tierUpdate[0].title}" → ${tierUpdate[0].service_tier} (₱${tierUpdate[0].base_price}, ${tierUpdate[0].vendor_rating}★)`);
    }
    
    // Step 3: Populate wedding_styles by category
    console.log('\n🎨 Step 3: Populating wedding_styles...');
    
    // Photography services
    const photoStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['romantic', 'elegant', 'modern', 'artistic']
      WHERE category = 'photography' 
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Photography: ${photoStyles.length} services`);
    
    // Videography services
    const videoStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['cinematic', 'modern', 'romantic', 'documentary']
      WHERE category = 'videography' 
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Videography: ${videoStyles.length} services`);
    
    // Venue services (garden/outdoor)
    const gardenVenues = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['rustic', 'garden', 'outdoor', 'natural', 'boho']
      WHERE category = 'venue' 
        AND (description ILIKE '%garden%' OR description ILIKE '%outdoor%' OR title ILIKE '%garden%')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Garden Venues: ${gardenVenues.length} services`);
    
    // Venue services (hotel/ballroom)
    const hotelVenues = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['elegant', 'formal', 'luxurious', 'grand', 'classic']
      WHERE category = 'venue' 
        AND (description ILIKE '%hotel%' OR description ILIKE '%ballroom%' OR title ILIKE '%hotel%')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Hotel Venues: ${hotelVenues.length} services`);
    
    // Venue services (beach)
    const beachVenues = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['beach', 'tropical', 'coastal', 'relaxed', 'romantic']
      WHERE category = 'venue' 
        AND (description ILIKE '%beach%' OR title ILIKE '%beach%')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Beach Venues: ${beachVenues.length} services`);
    
    // Catering services
    const cateringStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['traditional', 'modern', 'fusion', 'gourmet']
      WHERE category = 'catering' 
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Catering: ${cateringStyles.length} services`);
    
    // Flowers/Decor services
    const floralStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['romantic', 'rustic', 'elegant', 'whimsical', 'vintage']
      WHERE category IN ('flowers_decor', 'flowers', 'florist', 'decoration')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Flowers/Decor: ${floralStyles.length} services`);
    
    // DJ/Music services
    const musicStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['modern', 'festive', 'upbeat', 'versatile']
      WHERE category IN ('music_dj', 'dj', 'music', 'entertainment')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Music/DJ: ${musicStyles.length} services`);
    
    // Makeup/Hair services
    const beautyStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['elegant', 'glamorous', 'natural', 'modern']
      WHERE category IN ('makeup_hair', 'makeup', 'hair', 'beauty')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Makeup/Hair: ${beautyStyles.length} services`);
    
    // Wedding Planning services
    const planningStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['professional', 'personalized', 'organized', 'creative']
      WHERE category IN ('wedding_planning', 'planning', 'coordinator')
        AND (wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL)
      RETURNING id, title, wedding_styles
    `;
    console.log(`  ✅ Wedding Planning: ${planningStyles.length} services`);
    
    // Default styles for remaining services
    const defaultStyles = await sql`
      UPDATE services 
      SET wedding_styles = ARRAY['elegant', 'modern', 'versatile']
      WHERE wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL
      RETURNING id, title, category, wedding_styles
    `;
    console.log(`  ✅ Other categories: ${defaultStyles.length} services`);
    
    // Step 4: Populate cultural_specialties
    console.log('\n🌏 Step 4: Populating cultural_specialties...');
    
    // Filipino/Traditional
    const filipinoCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['filipino', 'traditional']
      WHERE (description ILIKE '%filipino%' OR description ILIKE '%traditional%' OR description ILIKE '%pinoy%')
        AND (cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL)
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ Filipino/Traditional: ${filipinoCulture.length} services`);
    
    // Chinese
    const chineseCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['chinese', 'tea_ceremony']
      WHERE (description ILIKE '%chinese%' OR description ILIKE '%tea ceremony%')
        AND (cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL)
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ Chinese: ${chineseCulture.length} services`);
    
    // Muslim/Halal
    const muslimCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['muslim', 'halal', 'islamic']
      WHERE (description ILIKE '%muslim%' OR description ILIKE '%halal%' OR description ILIKE '%islamic%')
        AND (cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL)
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ Muslim/Halal: ${muslimCulture.length} services`);
    
    // Indian/Hindu
    const indianCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['indian', 'hindu']
      WHERE (description ILIKE '%indian%' OR description ILIKE '%hindu%')
        AND (cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL)
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ Indian/Hindu: ${indianCulture.length} services`);
    
    // Spanish/Catholic (common in Philippines)
    const catholicCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['catholic', 'church_ceremony']
      WHERE (description ILIKE '%catholic%' OR description ILIKE '%church%')
        AND (cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL)
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ Catholic: ${catholicCulture.length} services`);
    
    // Default: All-inclusive (MORE FORGIVING - accepts all cultural preferences)
    const defaultCulture = await sql`
      UPDATE services 
      SET cultural_specialties = ARRAY['all_inclusive', 'multicultural', 'filipino', 'international']
      WHERE cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL
      RETURNING id, title, cultural_specialties
    `;
    console.log(`  ✅ All-inclusive: ${defaultCulture.length} services`);
    
    // Step 5: Populate years_in_business
    console.log('\n📅 Step 5: Populating years_in_business...');
    const yearsUpdate = await sql`
      UPDATE services 
      SET years_in_business = CASE
        WHEN vendor_rating >= 4.5 THEN 10
        WHEN vendor_rating >= 4.0 THEN 5
        WHEN vendor_rating >= 3.5 THEN 3
        ELSE 2
      END
      WHERE years_in_business IS NULL
      RETURNING id, title, years_in_business, vendor_rating
    `;
    console.log(`✅ Updated ${yearsUpdate.length} services with years_in_business`);
    if (yearsUpdate.length > 0) {
      console.log(`   Sample: "${yearsUpdate[0].title}" → ${yearsUpdate[0].years_in_business} years (${yearsUpdate[0].vendor_rating}★)`);
    }
    
    // Step 6: Populate location_data
    console.log('\n📍 Step 6: Populating location_data...');
    
    // Manila/NCR
    const manilaLocation = await sql`
      UPDATE services 
      SET location_data = jsonb_build_object(
        'city', 'Metro Manila',
        'region', 'NCR',
        'provinces', ARRAY['Metro Manila'],
        'service_radius_km', 50,
        'coordinates', jsonb_build_object('lat', 14.5995, 'lng', 120.9842)
      )
      WHERE (location ILIKE '%manila%' OR location ILIKE '%ncr%' OR location ILIKE '%quezon%' OR location ILIKE '%makati%')
        AND location_data IS NULL
      RETURNING id, title, location_data
    `;
    console.log(`  ✅ Manila/NCR: ${manilaLocation.length} services`);
    
    // Cebu
    const cebuLocation = await sql`
      UPDATE services 
      SET location_data = jsonb_build_object(
        'city', 'Cebu City',
        'region', 'Central Visayas',
        'provinces', ARRAY['Cebu'],
        'service_radius_km', 30,
        'coordinates', jsonb_build_object('lat', 10.3157, 'lng', 123.8854)
      )
      WHERE location ILIKE '%cebu%'
        AND location_data IS NULL
      RETURNING id, title, location_data
    `;
    console.log(`  ✅ Cebu: ${cebuLocation.length} services`);
    
    // Davao
    const davaoLocation = await sql`
      UPDATE services 
      SET location_data = jsonb_build_object(
        'city', 'Davao City',
        'region', 'Davao Region',
        'provinces', ARRAY['Davao del Sur'],
        'service_radius_km', 30,
        'coordinates', jsonb_build_object('lat', 7.1907, 'lng', 125.4553)
      )
      WHERE location ILIKE '%davao%'
        AND location_data IS NULL
      RETURNING id, title, location_data
    `;
    console.log(`  ✅ Davao: ${davaoLocation.length} services`);
    
    // Default location (NCR)
    const defaultLocation = await sql`
      UPDATE services 
      SET location_data = jsonb_build_object(
        'city', 'Metro Manila',
        'region', 'NCR',
        'provinces', ARRAY['Metro Manila'],
        'service_radius_km', 50,
        'coordinates', jsonb_build_object('lat', 14.5995, 'lng', 120.9842)
      )
      WHERE location_data IS NULL
      RETURNING id, title, location_data
    `;
    console.log(`  ✅ Default (NCR): ${defaultLocation.length} services`);
    
    // Step 7: Populate availability
    console.log('\n📅 Step 7: Populating availability...');
    const availabilityUpdate = await sql`
      UPDATE services 
      SET availability = jsonb_build_object(
        'calendar_enabled', true,
        'accepts_inquiries', true,
        'typical_response_time', '24 hours',
        'advance_booking_days', 90,
        'blackout_dates', ARRAY[]::text[]
      )
      WHERE availability IS NULL
      RETURNING id, title, availability
    `;
    console.log(`✅ Updated ${availabilityUpdate.length} services with availability`);
    
    // Step 8: Verify final state
    console.log('\n✅ Step 8: Verifying final state...');
    const finalState = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE service_tier IS NULL) as missing_tier,
        COUNT(*) FILTER (WHERE wedding_styles IS NULL OR array_length(wedding_styles, 1) IS NULL) as missing_styles,
        COUNT(*) FILTER (WHERE cultural_specialties IS NULL OR array_length(cultural_specialties, 1) IS NULL) as missing_cultures,
        COUNT(*) FILTER (WHERE years_in_business IS NULL) as missing_years,
        COUNT(*) FILTER (WHERE location_data IS NULL) as missing_location,
        COUNT(*) FILTER (WHERE availability IS NULL) as missing_availability,
        COUNT(*) as total_services
      FROM services
    `;
    
    console.log('Final state:');
    console.log(`  Total services: ${finalState[0].total_services}`);
    console.log(`  Missing service_tier: ${finalState[0].missing_tier} (${((1 - finalState[0].missing_tier / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    console.log(`  Missing wedding_styles: ${finalState[0].missing_styles} (${((1 - finalState[0].missing_styles / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    console.log(`  Missing cultural_specialties: ${finalState[0].missing_cultures} (${((1 - finalState[0].missing_cultures / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    console.log(`  Missing years_in_business: ${finalState[0].missing_years} (${((1 - finalState[0].missing_years / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    console.log(`  Missing location_data: ${finalState[0].missing_location} (${((1 - finalState[0].missing_location / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    console.log(`  Missing availability: ${finalState[0].missing_availability} (${((1 - finalState[0].missing_availability / finalState[0].total_services) * 100).toFixed(1)}% complete)`);
    
    // Step 9: Show sample populated services
    console.log('\n📋 Step 9: Sample populated services...');
    const samples = await sql`
      SELECT 
        id, 
        title, 
        category,
        service_tier,
        wedding_styles,
        cultural_specialties,
        years_in_business,
        location_data->>'city' as city,
        availability->>'typical_response_time' as response_time
      FROM services 
      WHERE service_tier IS NOT NULL 
        AND wedding_styles IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `;
    
    console.log('\nSample services:');
    samples.forEach((service, i) => {
      console.log(`\n${i + 1}. ${service.title} (${service.category})`);
      console.log(`   Tier: ${service.service_tier}`);
      console.log(`   Styles: ${service.wedding_styles?.join(', ')}`);
      console.log(`   Cultural: ${service.cultural_specialties?.join(', ')}`);
      console.log(`   Experience: ${service.years_in_business} years`);
      console.log(`   Location: ${service.city}`);
      console.log(`   Response: ${service.response_time}`);
    });
    
    console.log('\n✅ DSS fields population complete!');
    console.log('🎉 All services now have complete DSS data for intelligent matching.');
    
  } catch (error) {
    console.error('❌ Error populating DSS fields:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
populateDSSFields()
  .then(() => {
    console.log('\n🚀 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
