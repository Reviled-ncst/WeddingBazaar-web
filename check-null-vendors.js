// Check services with null vendor IDs
fetch('https://weddingbazaar-web.onrender.com/api/services')
.then(r => r.json())
.then(d => {
  console.log('Services with null vendor_id:');
  const nullVendorServices = d.services.filter(s => !s.vendor_id || s.vendor_id === 'null');
  
  nullVendorServices.forEach(s => {
    console.log(`- ${s.name} (ID: ${s.id}, vendor_id: ${s.vendor_id})`);
  });
  
  console.log(`\nTotal services: ${d.services.length}`);
  console.log(`Services without vendor: ${nullVendorServices.length}`);
})
.catch(console.error);
