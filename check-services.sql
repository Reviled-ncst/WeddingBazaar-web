SELECT s.id, s.service_name, s.vendor_id, 
       COUNT(p.id) as package_count
FROM services s
LEFT JOIN packages p ON p.service_id = s.id
WHERE s.vendor_id = 'c2fc2c29-88ff-470e-9fb7-9e0bfd3e8f1d'
GROUP BY s.id, s.service_name, s.vendor_id;
