# Location-Based Currency Conversion Implementation

## Overview
The Decision Support System (DSS) now includes automatic currency detection and conversion based on the user's location/country. This feature ensures that all prices are displayed in the user's local currency for better user experience.

## Architecture

### Location Detection Methods (Priority Order)

1. **Browser Geolocation API**: 
   - Uses `navigator.geolocation.getCurrentPosition()` to get precise coordinates
   - Converts coordinates to country codes using simplified geocoding logic
   - Most accurate but requires user permission

2. **Location String Analysis**:
   - Parses the `location` prop to detect country/city names
   - Uses keyword matching for major cities and countries
   - Fallback when geolocation is unavailable

3. **Browser Locale Detection**:
   - Uses `navigator.language` to detect user's locale
   - Extracts country code from locale string (e.g., "en-US" → "US")
   - Final fallback method

### Currency Service (`CurrencyService`)

Located in: `src/pages/users/individual/services/dss/services/index.ts`

#### Features:
- **Country-to-Currency Mapping**: Predefined mapping of country codes to currency configurations
- **Real Exchange Rates**: Uses realistic exchange rates for major currencies
- **Automatic Formatting**: Formats amounts with proper currency symbols and locale-specific formatting
- **Fallback Support**: Defaults to USD if detection fails

#### Supported Currencies:
```typescript
{
  'US': { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.82 },
  'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  'NZ': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rate: 1.65 },
  'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.15 },
  'EU': { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.36 },
  'HK': { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.82 }
}
```

## Implementation Flow

### 1. Orchestrator Level (`DSSOrchestrator.tsx`)

```typescript
// Auto-detect currency based on location
React.useEffect(() => {
  const detectCurrency = async () => {
    try {
      const detectedLocation = await CurrencyService.detectLocationAndCurrency(location);
      setLocationData(detectedLocation);
      console.log('Currency detected:', detectedLocation.currency);
    } catch (error) {
      // Fallback to USD
      setLocationData({
        country: 'US',
        region: location || '',
        currency: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
        timezone: 'America/New_York'
      });
    }
  };
  
  detectCurrency();
}, [location]);
```

### 2. Component Level (ServiceCard, PackageCard, etc.)

All pricing components now:
1. Accept `locationData` prop containing currency information
2. Use centralized `CurrencyService.formatCurrency()` method
3. Display prices in user's local currency automatically

```typescript
// Use location-based currency or fallback
const activeCurrency = locationData?.currency || { 
  code: 'USD', 
  symbol: '$', 
  name: 'US Dollar', 
  rate: 1.0 
};

const formatCurrency = (amount: number): string => {
  return CurrencyService.formatCurrency(amount, activeCurrency);
};
```

## Data Flow

```
User Location Input → CurrencyService.detectLocationAndCurrency()
    ↓
LocationData Object (country, currency, timezone)
    ↓
DSSOrchestrator (setLocationData)
    ↓
Tab Components (RecommendationsTab, PackagesTab, etc.)
    ↓
Individual Components (ServiceCard, PackageCard, etc.)
    ↓
CurrencyService.formatCurrency() → Displayed Price
```

## User Experience

### Automatic Detection
- **No user action required**: Currency is detected automatically when DSS opens
- **Real-time conversion**: All prices are converted and displayed in local currency
- **Consistent formatting**: Uses browser's Intl.NumberFormat for proper currency display

### Visual Indicators
- **Currency insights**: InsightsTab shows detected currency and conversion rate
- **Location context**: Displays country detection results
- **Exchange rate transparency**: Shows current exchange rate being used

### Examples
- **US User**: Sees "$5,000" 
- **Canadian User**: Sees "C$6,750" (with 1.35 exchange rate)
- **UK User**: Sees "£4,100" (with 0.82 exchange rate)
- **Indian User**: Sees "₹4,15,750" (with 83.15 exchange rate)

## Technical Features

### Error Handling
- **Graceful Fallbacks**: If any detection method fails, falls back to next method
- **Default Currency**: Always defaults to USD if all detection fails
- **Console Logging**: Logs detection results for debugging

### Performance
- **Memoization**: Currency detection runs only when location changes
- **Efficient Conversion**: Currency conversion happens only during display
- **Cached Results**: Location data is cached in component state

### Accessibility
- **Screen Reader Support**: Currency symbols and amounts are properly announced
- **Locale-aware Formatting**: Respects user's locale for number formatting
- **Clear Labeling**: Currency names and codes are displayed where relevant

## Future Enhancements

### Real-time Exchange Rates
- Integration with live currency APIs (e.g., exchangerate-api.io)
- Automatic rate updates based on market conditions
- Cache management for API rate limits

### Advanced Location Detection
- Integration with IP geolocation services
- More precise coordinate-to-country mapping
- Support for regional currency variations

### User Preferences
- Manual currency override option
- Saved currency preferences
- Multi-currency comparison views

## Configuration

### Adding New Currencies
1. Add currency configuration to `CurrencyService.currencies`
2. Update `detectCountryFromLocation()` keyword mapping
3. Update coordinate-based detection in `getCountryFromCoords()`

### Updating Exchange Rates
1. Modify rates in `CurrencyService.currencies` object
2. Consider implementing automated rate updates
3. Test conversion accuracy across all supported currencies

## Testing

### Manual Testing
1. Change browser language/locale
2. Provide different location strings
3. Test with various country/city names
4. Verify currency symbols and formatting

### Automated Testing
- Unit tests for currency detection logic
- Component tests for price display
- Integration tests for end-to-end flow
- Cross-browser compatibility testing

## Maintenance

### Regular Updates
- **Exchange Rates**: Update rates monthly or implement live rates
- **Currency Support**: Add new currencies based on user demand
- **Location Mapping**: Improve detection accuracy with user feedback

### Monitoring
- **Detection Success Rate**: Track how often detection succeeds
- **User Feedback**: Monitor for currency-related support requests
- **Performance Impact**: Ensure detection doesn't slow down DSS loading

This implementation provides a seamless, automatic currency conversion experience that enhances the global usability of the Wedding Bazaar platform.
