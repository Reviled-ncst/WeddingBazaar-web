# 🏦 Wallet System - Quick Reference Card

## 📊 Database Tables

### vendor_wallets
```sql
id, vendor_id, total_earnings, available_balance, 
pending_balance, withdrawn_amount, total_transactions
```

### wallet_transactions
```sql
id, transaction_id, wallet_id, vendor_id, transaction_type,
amount, status, booking_id, balance_before, balance_after,
service_name, couple_name, event_date, transaction_date
```

---

## 🔑 Transaction Types

| Type | ID Format | Amount | Status |
|------|-----------|--------|--------|
| deposit | `DEP-xxx` | + (in centavos) | completed |
| withdrawal | `WD-xxx` | - | pending → completed |
| refund | `REF-xxx` | - | completed |
| adjustment | `ADJ-xxx` | + or - | completed |

---

## 📡 API Endpoints

```
GET    /api/wallet/:vendorId              # Wallet summary
GET    /api/wallet/:vendorId/transactions # Transaction history
POST   /api/wallet/:vendorId/withdraw     # Request withdrawal
GET    /api/wallet/:vendorId/export       # CSV export
```

---

## 🔄 Automatic Flow

```
Booking Completed (both parties)
  ↓
createWalletDepositOnCompletion()
  ↓
Transaction Created (DEP-xxx)
  ↓
Wallet Balance Updated (+amount)
  ↓
Vendor Sees Earnings in Finances Page
```

---

## 💰 Balance Formula

```
total_earnings = available_balance + pending_balance + withdrawn_amount
```

---

## 🧪 Quick Test

### 1. Check Database
```sql
SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001';
SELECT * FROM wallet_transactions ORDER BY transaction_date DESC LIMIT 5;
```

### 2. Test API
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001
```

### 3. Frontend
```
Login → Vendor Dashboard → Finances Tab
Should see: ₱72,804.48 total earnings
```

---

## 📝 Key Files

```
backend-deploy/routes/wallet.cjs
backend-deploy/helpers/walletTransactionHelper.cjs
create-wallet-tables.cjs
```

---

## ✅ Success Indicators

- ✅ Wallet API returns 200 (not 500)
- ✅ available_balance matches sum of deposits
- ✅ Transaction history shows all movements
- ✅ Frontend Finances page loads earnings

---

## 🚨 Common Issues

**500 Error**: Check if tables exist
**Empty transactions**: Run migration script
**Wrong balance**: Sum transactions and compare

---

**Deployed**: October 29, 2025
**Commit**: `837d525`
**Status**: 🚀 Live (pending Render build)
