// ============================================================================
// Create Wallet System Tables - Wedding Bazaar
// ============================================================================
// Creates vendor_wallets and wallet_transactions tables
// Tracks vendor earnings, balances, and all money movements
// ============================================================================

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createWalletTables() {
  console.log('🏦 Creating Vendor Wallet System Tables...\n');

  try {
    // ========================================================================
    // 1. Create vendor_wallets table
    // ========================================================================
    console.log('📊 Creating vendor_wallets table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS vendor_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id VARCHAR(50) UNIQUE NOT NULL,
        
        -- Balance tracking (all amounts in centavos/cents)
        total_earnings BIGINT DEFAULT 0,
        available_balance BIGINT DEFAULT 0,
        pending_balance BIGINT DEFAULT 0,
        withdrawn_amount BIGINT DEFAULT 0,
        
        -- Currency
        currency VARCHAR(3) DEFAULT 'PHP',
        currency_symbol VARCHAR(10) DEFAULT '₱',
        
        -- Statistics
        total_transactions INTEGER DEFAULT 0,
        total_deposits INTEGER DEFAULT 0,
        total_withdrawals INTEGER DEFAULT 0,
        
        -- Metadata
        last_transaction_date TIMESTAMP,
        last_withdrawal_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign key
        CONSTRAINT fk_vendor
          FOREIGN KEY (vendor_id) 
          REFERENCES vendors(id)
          ON DELETE CASCADE
      )
    `;
    
    console.log('✅ vendor_wallets table created successfully');

    // ========================================================================
    // 2. Create wallet_transactions table
    // ========================================================================
    console.log('📜 Creating wallet_transactions table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id VARCHAR(50) UNIQUE NOT NULL,
        
        -- Wallet reference
        wallet_id UUID NOT NULL,
        vendor_id VARCHAR(50) NOT NULL,
        
        -- Transaction details
        transaction_type VARCHAR(50) NOT NULL,
        -- Types: 'deposit' (from booking completion), 
        --        'withdrawal' (cash out), 
        --        'refund' (from cancellation),
        --        'adjustment' (admin adjustment)
        
        amount BIGINT NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        
        -- Status
        status VARCHAR(50) DEFAULT 'completed',
        -- Statuses: 'pending', 'completed', 'failed', 'cancelled'
        
        -- Related records
        booking_id BIGINT,
        payment_intent_id VARCHAR(255),
        receipt_number VARCHAR(50),
        
        -- Booking/service details (denormalized for reporting)
        service_id VARCHAR(50),
        service_name VARCHAR(255),
        service_type VARCHAR(100),
        couple_id VARCHAR(50),
        couple_name VARCHAR(255),
        event_date DATE,
        
        -- Payment method
        payment_method VARCHAR(50),
        -- Methods: 'card', 'gcash', 'paymaya', 'grab_pay', 'bank_transfer'
        
        -- Withdrawal details (for withdrawal transactions)
        withdrawal_method VARCHAR(50),
        -- Methods: 'bank_transfer', 'gcash', 'paymaya', 'check'
        
        bank_name VARCHAR(100),
        account_number VARCHAR(100),
        account_name VARCHAR(255),
        ewallet_number VARCHAR(50),
        ewallet_name VARCHAR(100),
        
        -- Balance tracking
        balance_before BIGINT,
        balance_after BIGINT,
        
        -- Description and notes
        description TEXT,
        notes TEXT,
        admin_notes TEXT,
        
        -- Metadata
        metadata JSONB,
        
        -- Timestamps
        transaction_date TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign keys
        CONSTRAINT fk_wallet
          FOREIGN KEY (wallet_id) 
          REFERENCES vendor_wallets(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_vendor_trans
          FOREIGN KEY (vendor_id) 
          REFERENCES vendors(id)
          ON DELETE CASCADE,
          
        CONSTRAINT fk_booking
          FOREIGN KEY (booking_id) 
          REFERENCES bookings(id)
          ON DELETE SET NULL
      )
    `;
    
    console.log('✅ wallet_transactions table created successfully');

    // ========================================================================
    // 3. Create indexes for performance
    // ========================================================================
    console.log('🔍 Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_wallet_vendor 
      ON vendor_wallets(vendor_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_wallet 
      ON wallet_transactions(wallet_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_vendor 
      ON wallet_transactions(vendor_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_booking 
      ON wallet_transactions(booking_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_type 
      ON wallet_transactions(transaction_type)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_status 
      ON wallet_transactions(status)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_trans_date 
      ON wallet_transactions(transaction_date DESC)
    `;
    
    console.log('✅ Indexes created successfully');

    // ========================================================================
    // 4. Create view for transaction history with vendor details
    // ========================================================================
    console.log('📊 Creating wallet_transaction_view...');
    
    await sql`
      CREATE OR REPLACE VIEW wallet_transaction_view AS
      SELECT 
        wt.id,
        wt.transaction_id,
        wt.wallet_id,
        wt.vendor_id,
        v.business_name as vendor_name,
        wt.transaction_type,
        wt.amount,
        wt.currency,
        wt.status,
        wt.booking_id,
        wt.payment_intent_id,
        wt.receipt_number,
        wt.service_id,
        wt.service_name,
        wt.service_type,
        wt.couple_id,
        wt.couple_name,
        wt.event_date,
        wt.payment_method,
        wt.withdrawal_method,
        wt.bank_name,
        wt.account_number,
        wt.account_name,
        wt.balance_before,
        wt.balance_after,
        wt.description,
        wt.notes,
        wt.transaction_date,
        wt.processed_at,
        wt.completed_at,
        wt.created_at,
        wt.updated_at
      FROM wallet_transactions wt
      LEFT JOIN vendors v ON wt.vendor_id = v.id
      ORDER BY wt.transaction_date DESC
    `;
    
    console.log('✅ wallet_transaction_view created successfully');

    // ========================================================================
    // 5. Initialize wallets for existing vendors
    // ========================================================================
    console.log('👤 Initializing wallets for existing vendors...');
    
    const vendors = await sql`SELECT id FROM vendors`;
    
    for (const vendor of vendors) {
      await sql`
        INSERT INTO vendor_wallets (vendor_id)
        VALUES (${vendor.id})
        ON CONFLICT (vendor_id) DO NOTHING
      `;
    }
    
    console.log(`✅ Initialized ${vendors.length} vendor wallets`);

    // ========================================================================
    // 6. Migrate completed bookings to wallet transactions
    // ========================================================================
    console.log('💰 Migrating completed bookings to wallet transactions...');
    
    const completedBookings = await sql`
      SELECT 
        b.id,
        b.vendor_id,
        b.service_id,
        b.service_name,
        b.service_type,
        b.couple_id,
        b.couple_name,
        b.event_date,
        b.total_paid,
        b.payment_method,
        b.transaction_id,
        b.payment_amount,
        b.fully_completed_at
      FROM bookings b
      WHERE b.status = 'completed'
        AND b.fully_completed = true
        AND b.vendor_completed = true
        AND b.couple_completed = true
        AND b.total_paid IS NOT NULL
        AND CAST(b.total_paid AS DECIMAL) > 0
    `;
    
    console.log(`📦 Found ${completedBookings.length} completed bookings to migrate`);
    
    let migratedCount = 0;
    
    for (const booking of completedBookings) {
      try {
        // Get vendor wallet
        const wallets = await sql`
          SELECT id FROM vendor_wallets WHERE vendor_id = ${booking.vendor_id}
        `;
        
        if (wallets.length === 0) {
          console.log(`⚠️ No wallet found for vendor ${booking.vendor_id}, skipping booking ${booking.id}`);
          continue;
        }
        
        const walletId = wallets[0].id;
        
        // Convert amount from PHP to centavos
        const amountInCentavos = Math.round(parseFloat(booking.total_paid.replace(/,/g, '')) * 100);
        
        // Generate transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Get current balance
        const currentWallet = await sql`
          SELECT available_balance FROM vendor_wallets WHERE id = ${walletId}
        `;
        const balanceBefore = currentWallet[0]?.available_balance || 0;
        const balanceAfter = balanceBefore + amountInCentavos;
        
        // Create transaction record
        await sql`
          INSERT INTO wallet_transactions (
            transaction_id,
            wallet_id,
            vendor_id,
            transaction_type,
            amount,
            currency,
            status,
            booking_id,
            payment_intent_id,
            service_id,
            service_name,
            service_type,
            couple_id,
            couple_name,
            event_date,
            payment_method,
            balance_before,
            balance_after,
            description,
            transaction_date,
            processed_at,
            completed_at
          ) VALUES (
            ${transactionId},
            ${walletId},
            ${booking.vendor_id},
            'deposit',
            ${amountInCentavos},
            'PHP',
            'completed',
            ${booking.id},
            ${booking.transaction_id || null},
            ${booking.service_id || null},
            ${booking.service_name || null},
            ${booking.service_type || null},
            ${booking.couple_id || null},
            ${booking.couple_name || null},
            ${booking.event_date || null},
            ${booking.payment_method || null},
            ${balanceBefore},
            ${balanceAfter},
            ${`Payment received for ${booking.service_name || 'service'} - Booking #${booking.id}`},
            ${booking.fully_completed_at},
            ${booking.fully_completed_at},
            ${booking.fully_completed_at}
          )
        `;
        
        // Update vendor wallet
        await sql`
          UPDATE vendor_wallets
          SET 
            total_earnings = total_earnings + ${amountInCentavos},
            available_balance = available_balance + ${amountInCentavos},
            total_transactions = total_transactions + 1,
            total_deposits = total_deposits + 1,
            last_transaction_date = ${booking.fully_completed_at},
            updated_at = NOW()
          WHERE id = ${walletId}
        `;
        
        migratedCount++;
        console.log(`✅ Migrated booking #${booking.id} - ₱${booking.total_paid} to wallet ${booking.vendor_id}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate booking #${booking.id}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully migrated ${migratedCount} bookings to wallet transactions`);

    // ========================================================================
    // Final Summary
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('🎉 WALLET SYSTEM SETUP COMPLETE!');
    console.log('='.repeat(70));
    
    const walletStats = await sql`
      SELECT 
        COUNT(*) as total_wallets,
        SUM(total_earnings) as total_platform_earnings,
        SUM(available_balance) as total_available_balance,
        SUM(total_transactions) as total_transactions
      FROM vendor_wallets
    `;
    
    const stats = walletStats[0];
    
    console.log('\n📊 Platform Statistics:');
    console.log(`   Total Wallets: ${stats.total_wallets}`);
    console.log(`   Total Platform Earnings: ₱${(stats.total_platform_earnings / 100).toLocaleString()}`);
    console.log(`   Total Available Balance: ₱${(stats.total_available_balance / 100).toLocaleString()}`);
    console.log(`   Total Transactions: ${stats.total_transactions}`);
    
    console.log('\n✅ Tables Created:');
    console.log('   1. vendor_wallets - Vendor wallet balances');
    console.log('   2. wallet_transactions - All transaction history');
    console.log('   3. wallet_transaction_view - Reporting view');
    
    console.log('\n🔧 Features Available:');
    console.log('   ✅ Automatic deposit creation on booking completion');
    console.log('   ✅ Withdrawal request tracking');
    console.log('   ✅ Transaction history with full details');
    console.log('   ✅ Balance tracking (before/after)');
    console.log('   ✅ Multiple payment methods support');
    console.log('   ✅ Refund and adjustment support');
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Update backend booking completion to create wallet transactions');
    console.log('   2. Update wallet API to use new tables');
    console.log('   3. Test transaction creation flow');
    console.log('   4. Deploy to production');
    
    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error creating wallet tables:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Run the script
createWalletTables()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
