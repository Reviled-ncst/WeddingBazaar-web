# 🧪 Auto-Integration Testing Guide

## 🎯 **Objective**
Test the automatic creation of coordinator client and wedding records when a couple books a coordinator service.

---

## 📋 **Prerequisites**

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Firebase
- [ ] Test coordinator vendor exists in database
- [ ] Test couple account exists

---

## 🧪 **Test Scenario**

### **Scenario: Couple Books Coordinator for First Time**

**Expected Result**: 
- ✅ Booking created successfully
- ✅ Client record auto-created
- ✅ Wedding record auto-created
- ✅ 6 default milestones created
- ✅ Activity logged

---

## 🔬 **Step-by-Step Testing**

### **Step 1: Login as Couple**

1. Navigate to: https://weddingbazaarph.web.app
2. Click "Login" button
3. Login with test couple account:
   - Email: `testcouple@example.com`
   - Password: `testpass123`

### **Step 2: Browse Services**

1. Navigate to: https://weddingbazaarph.web.app/individual/services
2. Use filter: **Category → "Wedding Coordination"**
3. Find a coordinator service
4. Click "Book Now" or "View Details"

### **Step 3: Fill Booking Form**

**Required Fields:**
- **Your Name**: John & Jane Doe
- **Email**: johnjane@email.com
- **Phone**: +63 912 345 6789
- **Event Date**: June 15, 2025
- **Event Location**: Manila Hotel Ballroom
- **Guest Count**: 150
- **Budget Range**: ₱50,000 - ₱100,000
- **Special Requests**: "Need full wedding planning coordination"

**Submit Booking**

### **Step 4: Verify Backend Logs**

1. Go to: https://dashboard.render.com
2. Navigate to: `weddingbazaar-web` service
3. Click "Logs" tab
4. Search for: `AUTO-INTEGRATION`

**Expected Log Output:**
```
🤖 AUTO-INTEGRATION: Checking if booking is for coordinator...
✅ Confirmed coordinator booking, proceeding with auto-integration...
🤖 AUTO-CREATE: Creating coordinator client for booking: [BOOKING_ID]
✅ AUTO-CREATE: Coordinator client created: [CLIENT_ID]
🤖 AUTO-CREATE: Creating coordinator wedding for booking: [BOOKING_ID]
✅ AUTO-CREATE: Coordinator wedding created: [WEDDING_ID]
✅ AUTO-CREATE: Linked client to wedding
✅ AUTO-CREATE: Created 6 default milestones
🎉 AUTO-INTEGRATION SUCCESS: {
  success: true,
  client: { id: [CLIENT_ID], ... },
  wedding: { id: [WEDDING_ID], ... }
}
```

### **Step 5: Verify Database Records**

**Connect to Neon Database:**

```sql
-- 1. Check booking was created
SELECT * FROM bookings 
WHERE couple_name = 'John & Jane Doe' 
ORDER BY created_at DESC LIMIT 1;

-- Copy the booking ID, then:

-- 2. Check client was auto-created
SELECT * FROM coordinator_clients
WHERE couple_name = 'John & Jane Doe'
ORDER BY created_at DESC LIMIT 1;

-- Copy the client ID, then:

-- 3. Check wedding was auto-created
SELECT * FROM coordinator_weddings
WHERE couple_name = 'John & Jane Doe'
ORDER BY created_at DESC LIMIT 1;

-- Copy the wedding ID, then:

-- 4. Check client is linked to wedding
SELECT 
  c.id as client_id,
  c.couple_name,
  c.status as client_status,
  c.wedding_id,
  w.id as wedding_id_from_table,
  w.wedding_date,
  w.venue,
  w.status as wedding_status
FROM coordinator_clients c
LEFT JOIN coordinator_weddings w ON c.wedding_id = w.id
WHERE c.couple_name = 'John & Jane Doe';

-- 5. Check milestones were created
SELECT * FROM wedding_milestones
WHERE wedding_id = '[WEDDING_ID_FROM_STEP_3]'
ORDER BY due_date;

-- 6. Check activity log
SELECT * FROM coordinator_activity_log
WHERE activity_type IN ('client_created', 'wedding_created')
ORDER BY created_at DESC LIMIT 5;
```

**Expected Results:**

| Check | Expected Value |
|-------|---------------|
| **Booking Status** | `request` |
| **Client Created** | ✅ Yes |
| **Client Status** | `active` |
| **Wedding Created** | ✅ Yes |
| **Wedding Status** | `planning` |
| **Wedding Progress** | `0` |
| **Client Linked to Wedding** | ✅ Yes (`client.wedding_id = wedding.id`) |
| **Milestones Count** | `6` |
| **Activity Log Entries** | `2` (client_created, wedding_created) |

### **Step 6: Login as Coordinator**

1. Logout from couple account
2. Navigate to: https://weddingbazaarph.web.app
3. Login with coordinator account:
   - Email: `coordinator@example.com`
   - Password: `coordpass123`

### **Step 7: Verify Dashboard Updates**

1. Navigate to: https://weddingbazaarph.web.app/coordinator/dashboard

**Check Dashboard Stats:**
- [ ] **Active Clients**: +1 (should increase)
- [ ] **Active Weddings**: +1 (should increase)
- [ ] **Total Revenue**: Updated (if booking has amount)
- [ ] **Recent Activities**: Shows "client_created" and "wedding_created"

### **Step 8: Verify Clients Page**

1. Navigate to: https://weddingbazaarph.web.app/coordinator/clients

**Verify Client Card:**
- [ ] Client name: "John & Jane Doe"
- [ ] Email: johnjane@email.com
- [ ] Phone: +63 912 345 6789
- [ ] Status: "Active" (green badge)
- [ ] Budget Range: ₱50,000 - ₱100,000
- [ ] Wedding ID: Linked to wedding
- [ ] Created date: Today

### **Step 9: Verify Weddings Page**

1. Navigate to: https://weddingbazaarph.web.app/coordinator/weddings

**Verify Wedding Card:**
- [ ] Couple name: "John & Jane Doe"
- [ ] Wedding date: June 15, 2025
- [ ] Venue: "Manila Hotel Ballroom"
- [ ] Status: "Planning" (yellow badge)
- [ ] Progress: 0%
- [ ] Guest count: 150
- [ ] Budget: ₱75,000 (estimated from range)
- [ ] Created date: Today

### **Step 10: Verify Milestones**

1. Click "View Details" on the wedding card
2. Navigate to "Milestones" section (if available)

**Expected Milestones (6 total):**

| Milestone | Days Before Wedding | Due Date | Status |
|-----------|-------------------|----------|--------|
| Initial Consultation | 7 | June 8, 2025 | ⭕ Pending |
| Venue Selection | 30 | May 16, 2025 | ⭕ Pending |
| Vendor Booking | 60 | April 16, 2025 | ⭕ Pending |
| Design & Decor | 90 | March 17, 2025 | ⭕ Pending |
| Final Details | 14 | June 1, 2025 | ⭕ Pending |
| Rehearsal | 1 | June 14, 2025 | ⭕ Pending |

---

## ✅ **Test Result Checklist**

### **Backend Integration**
- [ ] No errors in Render logs
- [ ] Auto-integration logs appear
- [ ] Success message logged
- [ ] Client created log entry
- [ ] Wedding created log entry
- [ ] 6 milestones created log entry

### **Database Records**
- [ ] Booking exists with correct data
- [ ] Client record created with matching couple_name
- [ ] Wedding record created with matching couple_name
- [ ] Client.wedding_id links to Wedding.id
- [ ] 6 milestones exist for wedding
- [ ] Activity log has 2 entries (client + wedding)

### **Coordinator Dashboard**
- [ ] Active clients count increased
- [ ] Active weddings count increased
- [ ] Recent activities show auto-created records

### **Clients Page**
- [ ] New client appears in list
- [ ] All client data correct
- [ ] Status is "Active"
- [ ] Wedding link is present

### **Weddings Page**
- [ ] New wedding appears in list
- [ ] All wedding data correct
- [ ] Status is "Planning"
- [ ] Progress is 0%

### **Milestones**
- [ ] 6 milestones created
- [ ] Due dates calculated correctly
- [ ] All milestones marked as pending

---

## 🐛 **Troubleshooting**

### **Issue: No auto-integration logs**

**Possible Causes:**
1. Vendor is not a coordinator
2. Booking creation failed
3. Auto-integration module not loaded

**Solutions:**
- Check `vendor_profiles.business_type` contains "Coordination"
- Verify booking was created successfully
- Check Render logs for module loading errors

### **Issue: Client created but not wedding**

**Possible Causes:**
1. Missing required fields (event_date)
2. Database constraint error
3. Milestone creation failed

**Solutions:**
- Verify booking has event_date
- Check database logs for errors
- Check if coordinator_weddings table exists

### **Issue: Milestones not created**

**Possible Causes:**
1. Wedding creation failed
2. wedding_milestones table missing
3. Date calculation error

**Solutions:**
- Verify wedding was created
- Check if wedding_milestones table exists
- Check backend logs for milestone errors

---

## 📊 **Expected Performance**

| Metric | Expected Value |
|--------|---------------|
| **Total Processing Time** | < 500ms |
| **Database Queries** | 8-10 queries |
| **API Response Time** | < 300ms |
| **Success Rate** | > 95% |

---

## 📝 **Test Report Template**

```markdown
# Auto-Integration Test Report

**Date**: [DATE]
**Tester**: [NAME]
**Environment**: Production (Render + Firebase)

## Test Results

- [ ] ✅ PASS - Booking created successfully
- [ ] ✅ PASS - Client auto-created
- [ ] ✅ PASS - Wedding auto-created
- [ ] ✅ PASS - Milestones created (6)
- [ ] ✅ PASS - Activity logged
- [ ] ✅ PASS - Dashboard updated
- [ ] ✅ PASS - Clients page shows new client
- [ ] ✅ PASS - Weddings page shows new wedding

## Issues Found

[None / List issues here]

## Screenshots

[Attach screenshots of:]
- Backend logs
- Database records
- Coordinator dashboard
- Clients page
- Weddings page

## Conclusion

[PASS / FAIL / PARTIAL]

## Recommendations

[Any recommendations for improvements]
```

---

## 🚀 **Next Steps After Testing**

### **If All Tests Pass** ✅
1. Document test results
2. Update implementation dashboard
3. Proceed to next feature (Vendor CRUD modals)
4. Plan mobile testing

### **If Tests Fail** ❌
1. Document exact error
2. Check backend logs
3. Review database state
4. Debug and fix issue
5. Re-deploy and re-test

---

## 📞 **Support**

**Documentation**: 
- [Auto-Integration Complete Guide](./COORDINATOR_AUTO_INTEGRATION_COMPLETE.md)
- [Implementation Dashboard](./COORDINATOR_IMPLEMENTATION_DASHBOARD.md)
- [Database Mapping](./COORDINATOR_DATABASE_MAPPING_PLAN.md)

**Backend Logs**: https://dashboard.render.com/web/srv-xxx/logs  
**Database Console**: https://console.neon.tech

---

**Happy Testing! 🧪✨**

