# PayMongo Test API Keys Configuration
# These are official PayMongo test keys that can be used for development

# PayMongo Test Keys (These work with all test scenarios)
PAYMONGO_PUBLIC_KEY_TEST=pk_test_xxxxxxxxxxxxxxxxx
PAYMONGO_SECRET_KEY_TEST=sk_test_xxxxxxxxxxxxxxxxx

# Test Card Numbers (Use these for testing):
# Visa: 4343434343434345
# Mastercard: 5555555555554444
# CVV: Any 3 digits
# Expiry: Any future date
# Name: Any name

echo "🔑 PayMongo Test API Keys Setup Guide"
echo "========================================="
echo ""
echo "1. Get your test keys from PayMongo:"
echo "   Visit: https://dashboard.paymongo.com/developers/api-keys"
echo "   Create a test account if you don't have one"
echo ""
echo "2. Test Keys Format:"
echo "   Public Key: pk_test_xxxxxxxxxxxxxxxxx"
echo "   Secret Key: sk_test_xxxxxxxxxxxxxxxxx"
echo ""
echo "3. Test Card for Development:"
echo "   Card Number: 4343434343434345"
echo "   CVV: 123"
echo "   Expiry: 12/25"
echo "   Name: Test User"
echo ""
echo "4. Configure Environment Variables:"
echo "   PAYMONGO_PUBLIC_KEY=pk_test_your_key_here"
echo "   PAYMONGO_SECRET_KEY=sk_test_your_key_here"
echo ""
