# DSS Add Service Form - Code Snippets Reference

**Quick Copy-Paste Reference for Implementation**  
**Date:** January 2025  

---

## 🎯 OVERVIEW

This document contains **ready-to-use code snippets** for adding DSS fields to the Add Service Form. Simply copy and paste these into the appropriate locations in `AddServiceForm.tsx`.

---

## 📍 STEP 1: PRIORITY 1 FIELDS

### Location: After the Location Field in Step 1

Find this section (around line 800-900):
```tsx
{/* Location Field */}
<div className="form-group">
  <label>Service Location</label>
  <LocationPicker ... />
</div>
```

**INSERT THESE FIELDS RIGHT AFTER:**

---

### Snippet 1.1: Years in Business Input

```tsx
{/* Years in Business - DSS Field */}
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Years in Business
    <span className="text-xs text-gray-500 ml-2">(Helps customers find experienced vendors)</span>
  </label>
  <input
    type="number"
    min="0"
    max="50"
    value={formData.yearsInBusiness || 0}
    onChange={(e) => {
      const value = Math.max(0, Math.min(50, parseInt(e.target.value) || 0));
      setFormData(prev => ({ ...prev, yearsInBusiness: value }));
    }}
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
    placeholder="e.g., 5"
  />
  {formData.yearsInBusiness >= 5 && (
    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
      <CheckCircle2 className="w-4 h-4" />
      <span>5+ years experience gives you a boost in recommendations!</span>
    </div>
  )}
  <p className="text-xs text-gray-500 mt-1">
    How many years have you been providing this service?
  </p>
</div>
```

---

### Snippet 1.2: Availability Status Selector

```tsx
{/* Availability Status - DSS Field */}
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Current Availability
    <span className="text-xs text-gray-500 ml-2">(Available services get priority in recommendations)</span>
  </label>
  <div className="grid grid-cols-3 gap-3">
    <button
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, availability: 'available' }))}
      className={`px-4 py-4 rounded-lg border-2 transition-all font-medium ${
        formData.availability === 'available'
          ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
          : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-sm'
      }`}
    >
      <div className="text-2xl mb-1">✅</div>
      <div className="text-sm">Available</div>
      <div className="text-xs opacity-75">Accepting Bookings</div>
    </button>
    
    <button
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, availability: 'limited' }))}
      className={`px-4 py-4 rounded-lg border-2 transition-all font-medium ${
        formData.availability === 'limited'
          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm'
          : 'border-gray-300 bg-white hover:border-yellow-300 hover:shadow-sm'
      }`}
    >
      <div className="text-2xl mb-1">⚠️</div>
      <div className="text-sm">Limited</div>
      <div className="text-xs opacity-75">Few Slots Left</div>
    </button>
    
    <button
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, availability: 'booked' }))}
      className={`px-4 py-4 rounded-lg border-2 transition-all font-medium ${
        formData.availability === 'booked'
          ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
          : 'border-gray-300 bg-white hover:border-red-300 hover:shadow-sm'
      }`}
    >
      <div className="text-2xl mb-1">🚫</div>
      <div className="text-sm">Fully Booked</div>
      <div className="text-xs opacity-75">Not Accepting</div>
    </button>
  </div>
  
  {formData.availability === 'available' && (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-700">
        <strong>Great!</strong> Available services appear higher in search results and recommendations.
      </p>
    </div>
  )}
</div>
```

---

### Snippet 1.3: Service Tier Toggles

```tsx
{/* Service Tier - DSS Field */}
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Service Tier
    <span className="text-xs text-gray-500 ml-2">(Helps match with the right customers)</span>
  </label>
  
  <div className="space-y-3">
    {/* Premium Service Toggle */}
    <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-300 hover:border-pink-300 cursor-pointer transition-all group">
      <input
        type="checkbox"
        checked={formData.isPremium || false}
        onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
        className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-pink-500 focus:ring-offset-2"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-900">Premium Service</span>
        </div>
        <p className="text-sm text-gray-600">
          High-quality service with premium features and pricing. Premium services get a +10 point boost in recommendations.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            Higher Visibility
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            Matches Luxury Budgets
          </span>
        </div>
      </div>
      {formData.isPremium && (
        <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0" />
      )}
    </label>

    {/* Featured Service Toggle */}
    <label className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-300 hover:border-pink-300 cursor-pointer transition-all group">
      <input
        type="checkbox"
        checked={formData.isFeatured || false}
        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
        className="mt-1 w-5 h-5 text-pink-600 rounded focus:ring-pink-500 focus:ring-offset-2"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-gray-900">Featured Service</span>
        </div>
        <p className="text-sm text-gray-600">
          Showcase your service in featured sections, homepage highlights, and top of search results.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Homepage Featured
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Top Search Results
          </span>
        </div>
      </div>
      {formData.isFeatured && (
        <CheckCircle2 className="w-6 h-6 text-pink-500 flex-shrink-0" />
      )}
    </label>
  </div>
  
  {(formData.isPremium || formData.isFeatured) && (
    <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
      <p className="text-sm text-pink-700">
        <strong>Excellent choice!</strong> Premium and featured services receive more visibility and better placement in recommendations.
      </p>
    </div>
  )}
</div>
```

---

## 📍 STEP 2: WEDDING STYLES & CULTURE

### Location: Create New Step 2 (Style & Preferences)

Find the step navigation section and insert a new step between current Step 1 and Step 2.

---

### Snippet 2.1: Wedding Styles Multi-Select

```tsx
{/* Step 2: Wedding Styles & Preferences */}
{currentStep === 2 && (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Style & Preferences</h3>
      <p className="text-gray-600">Help couples find your perfect style match</p>
    </div>

    {/* Wedding Styles - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Wedding Styles You Specialize In
        <span className="text-xs text-gray-500 ml-2">(Select all that apply - helps match with couples' vision)</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { value: 'romantic', label: 'Romantic', emoji: '💕', desc: 'Soft, dreamy, love-focused' },
          { value: 'elegant', label: 'Elegant', emoji: '✨', desc: 'Sophisticated & refined' },
          { value: 'rustic', label: 'Rustic', emoji: '🌾', desc: 'Natural, countryside charm' },
          { value: 'modern', label: 'Modern', emoji: '🏙️', desc: 'Contemporary & trendy' },
          { value: 'vintage', label: 'Vintage', emoji: '🕰️', desc: 'Classic retro style' },
          { value: 'bohemian', label: 'Bohemian', emoji: '🌸', desc: 'Free-spirited & eclectic' },
          { value: 'beach', label: 'Beach', emoji: '🏖️', desc: 'Coastal & tropical' },
          { value: 'garden', label: 'Garden', emoji: '🌳', desc: 'Outdoor, nature-inspired' },
          { value: 'classic', label: 'Classic', emoji: '🎩', desc: 'Timeless & traditional' },
          { value: 'luxury', label: 'Luxury', emoji: '👑', desc: 'Opulent & extravagant' },
          { value: 'minimalist', label: 'Minimalist', emoji: '⚪', desc: 'Simple & clean' },
          { value: 'cultural', label: 'Cultural', emoji: '🎭', desc: 'Traditional ceremonies' }
        ].map(style => {
          const isSelected = (formData.weddingStyles || []).includes(style.value);
          
          return (
            <label
              key={style.value}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105'
                  : 'border-gray-300 bg-white hover:border-pink-300 hover:shadow-sm'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    weddingStyles: e.target.checked
                      ? [...(prev.weddingStyles || []), style.value]
                      : (prev.weddingStyles || []).filter(s => s !== style.value)
                  }));
                }}
                className="sr-only"
              />
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-500" />
                </div>
              )}
              
              <span className="text-3xl mb-2">{style.emoji}</span>
              <span className={`font-medium text-center mb-1 ${
                isSelected ? 'text-pink-700' : 'text-gray-900'
              }`}>
                {style.label}
              </span>
              <span className="text-xs text-gray-500 text-center">{style.desc}</span>
            </label>
          );
        })}
      </div>
      
      {(formData.weddingStyles || []).length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{(formData.weddingStyles || []).length} style{(formData.weddingStyles || []).length !== 1 ? 's' : ''} selected.</strong> Couples searching for these styles will see your service!
          </p>
        </div>
      )}
    </div>

    {/* Continue to Cultural Support below... */}
  </motion.div>
)}
```

---

### Snippet 2.2: Cultural/Religious Support

```tsx
{/* Cultural & Religious Support - DSS Field */}
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Cultural & Religious Ceremonies Supported
    <span className="text-xs text-gray-500 ml-2">(Optional - helps match with specific cultural needs)</span>
  </label>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[
      { value: 'catholic', label: 'Catholic Wedding', icon: '⛪' },
      { value: 'christian', label: 'Christian Ceremony', icon: '✝️' },
      { value: 'muslim', label: 'Muslim Wedding (Nikah)', icon: '☪️' },
      { value: 'hindu', label: 'Hindu Ceremony', icon: '🕉️' },
      { value: 'buddhist', label: 'Buddhist Ceremony', icon: '☸️' },
      { value: 'chinese', label: 'Chinese Traditional', icon: '🏮' },
      { value: 'filipino', label: 'Filipino Traditional', icon: '🇵🇭' },
      { value: 'interfaith', label: 'Interfaith Ceremonies', icon: '🤝' },
      { value: 'civil', label: 'Civil Ceremony', icon: '⚖️' },
      { value: 'secular', label: 'Secular/Non-Religious', icon: '💫' }
    ].map(culture => {
      const isSelected = (formData.culturalSupport || []).includes(culture.value);
      
      return (
        <label
          key={culture.value}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            isSelected
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 bg-white hover:border-pink-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                culturalSupport: e.target.checked
                  ? [...(prev.culturalSupport || []), culture.value]
                  : (prev.culturalSupport || []).filter(c => c !== culture.value)
              }));
            }}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
          />
          <span className="text-2xl">{culture.icon}</span>
          <span className={`font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
            {culture.label}
          </span>
          {isSelected && (
            <CheckCircle2 className="w-5 h-5 text-pink-500 ml-auto" />
          )}
        </label>
      );
    })}
  </div>
  
  {(formData.culturalSupport || []).length > 0 && (
    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
      <p className="text-sm text-indigo-700">
        <strong>Inclusive service!</strong> You support {(formData.culturalSupport || []).length} cultural/religious tradition{(formData.culturalSupport || []).length !== 1 ? 's' : ''}.
      </p>
    </div>
  )}
</div>
```

---

## 📍 STEP 3: CONDITIONAL VENUE FIELDS

### Location: Inside Step 2 or Create Dedicated Venue Step

Add conditional rendering based on category selection.

---

### Snippet 3.1: Venue Type & Features (Full Section)

```tsx
{/* VENUE-SPECIFIC FIELDS - Show only if category is Venue */}
{formData.category === 'Venue' && (
  <>
    <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Venue-Specific Details</h4>
      </div>
      <p className="text-sm text-purple-700">
        Help couples find the perfect venue by providing detailed information about your space.
      </p>
    </div>

    {/* Venue Type - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Venue Type
        <span className="text-xs text-gray-500 ml-2">(What kind of space do you offer?)</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { value: 'beach', label: 'Beach', emoji: '🏖️' },
          { value: 'garden', label: 'Garden', emoji: '🌳' },
          { value: 'hotel', label: 'Hotel', emoji: '🏨' },
          { value: 'ballroom', label: 'Ballroom', emoji: '💃' },
          { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
          { value: 'church', label: 'Church', emoji: '⛪' },
          { value: 'outdoor', label: 'Outdoor', emoji: '🌤️' },
          { value: 'indoor', label: 'Indoor', emoji: '🏛️' },
          { value: 'rooftop', label: 'Rooftop', emoji: '🏙️' },
          { value: 'barn', label: 'Barn/Rustic', emoji: '🌾' },
          { value: 'resort', label: 'Resort', emoji: '🏝️' },
          { value: 'mansion', label: 'Mansion', emoji: '🏰' }
        ].map(type => {
          const isSelected = formData.venueType === type.value;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, venueType: type.value }))}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.emoji}</div>
              <div className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                {type.label}
              </div>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-pink-500 mx-auto mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>

    {/* Venue Features - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Venue Features & Amenities
        <span className="text-xs text-gray-500 ml-2">(Select all amenities your venue offers)</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { value: 'parking', label: 'Parking Available', icon: '🅿️' },
          { value: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
          { value: 'ac', label: 'Air Conditioned', icon: '❄️' },
          { value: 'outdoor_space', label: 'Outdoor Space', icon: '🌳' },
          { value: 'indoor_space', label: 'Indoor Space', icon: '🏛️' },
          { value: 'catering', label: 'Catering Kitchen', icon: '🍽️' },
          { value: 'dressing_rooms', label: 'Dressing Rooms', icon: '👗' },
          { value: 'sound_system', label: 'Sound System', icon: '🔊' },
          { value: 'stage', label: 'Stage/Platform', icon: '🎭' },
          { value: 'dance_floor', label: 'Dance Floor', icon: '💃' },
          { value: 'accommodation', label: 'Guest Accommodation', icon: '🛏️' },
          { value: 'generator', label: 'Backup Generator', icon: '⚡' },
          { value: 'wifi', label: 'WiFi Available', icon: '📶' },
          { value: 'restrooms', label: 'Clean Restrooms', icon: '🚻' },
          { value: 'security', label: 'Security Service', icon: '🔒' },
          { value: 'bar', label: 'Bar/Drinks Service', icon: '🍹' }
        ].map(feature => {
          const isSelected = (formData.venueFeatures || []).includes(feature.value);
          
          return (
            <label
              key={feature.value}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    venueFeatures: e.target.checked
                      ? [...(prev.venueFeatures || []), feature.value]
                      : (prev.venueFeatures || []).filter(f => f !== feature.value)
                  }));
                }}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-lg">{feature.icon}</span>
              <span className={`text-sm ${isSelected ? 'text-pink-700 font-medium' : 'text-gray-700'}`}>
                {feature.label}
              </span>
            </label>
          );
        })}
      </div>
      
      {(formData.venueFeatures || []).length > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>{(formData.venueFeatures || []).length} amenities</strong> - More features = better matches!
          </p>
        </div>
      )}
    </div>

    {/* Guest Capacity - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Guest Capacity
        <span className="text-xs text-gray-500 ml-2">(How many guests can your venue accommodate?)</span>
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block font-medium">
            Minimum Capacity
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={formData.minGuestCapacity || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || undefined;
              setFormData(prev => ({ ...prev, minGuestCapacity: value }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="e.g., 50"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum guests for bookings</p>
        </div>
        
        <div>
          <label className="text-sm text-gray-600 mb-2 block font-medium">
            Maximum Capacity
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={formData.maxGuestCapacity || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value) || undefined;
              setFormData(prev => ({ ...prev, maxGuestCapacity: value }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="e.g., 200"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum comfortable capacity</p>
        </div>
      </div>
      
      {formData.minGuestCapacity && formData.maxGuestCapacity && (
        <>
          {formData.minGuestCapacity > formData.maxGuestCapacity ? (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                <strong>Invalid range:</strong> Minimum capacity cannot be greater than maximum capacity.
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Capacity: {formData.minGuestCapacity} - {formData.maxGuestCapacity} guests</strong> - Couples will see this in search results!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  </>
)}
```

---

## 📍 STEP 4: CONDITIONAL CATERING FIELDS

### Snippet 4.1: Catering Details (Full Section)

```tsx
{/* CATERING-SPECIFIC FIELDS - Show only if category is Catering */}
{formData.category === 'Catering' && (
  <>
    <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-orange-600" />
        <h4 className="font-semibold text-orange-900">Catering-Specific Details</h4>
      </div>
      <p className="text-sm text-orange-700">
        Help couples find the perfect menu by sharing your culinary offerings and service styles.
      </p>
    </div>

    {/* Dietary Options - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Dietary Options Available
        <span className="text-xs text-gray-500 ml-2">(Check all dietary accommodations you can provide)</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
          { value: 'vegan', label: 'Vegan', icon: '🌱' },
          { value: 'halal', label: 'Halal', icon: '☪️' },
          { value: 'kosher', label: 'Kosher', icon: '✡️' },
          { value: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
          { value: 'dairy_free', label: 'Dairy-Free', icon: '🥛' },
          { value: 'nut_free', label: 'Nut-Free', icon: '🥜' },
          { value: 'low_carb', label: 'Low-Carb', icon: '🥑' },
          { value: 'keto', label: 'Keto-Friendly', icon: '🥩' }
        ].map(option => {
          const isSelected = (formData.dietaryOptions || []).includes(option.value);
          
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    dietaryOptions: e.target.checked
                      ? [...(prev.dietaryOptions || []), option.value]
                      : (prev.dietaryOptions || []).filter(o => o !== option.value)
                  }));
                }}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-xl">{option.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      
      {(formData.dietaryOptions || []).length > 0 && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Inclusive menu!</strong> You accommodate {(formData.dietaryOptions || []).length} dietary restriction{(formData.dietaryOptions || []).length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>

    {/* Cuisine Types - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Cuisine Types Offered
        <span className="text-xs text-gray-500 ml-2">(What types of cuisine do you specialize in?)</span>
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { value: 'filipino', label: 'Filipino', icon: '🇵🇭' },
          { value: 'international', label: 'International', icon: '🌍' },
          { value: 'asian_fusion', label: 'Asian Fusion', icon: '🍜' },
          { value: 'italian', label: 'Italian', icon: '🍝' },
          { value: 'japanese', label: 'Japanese', icon: '🍱' },
          { value: 'chinese', label: 'Chinese', icon: '🥢' },
          { value: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
          { value: 'continental', label: 'Continental', icon: '🍽️' },
          { value: 'seafood', label: 'Seafood', icon: '🦞' },
          { value: 'bbq', label: 'BBQ/Grill', icon: '🔥' },
          { value: 'french', label: 'French', icon: '🥖' },
          { value: 'mexican', label: 'Mexican', icon: '🌮' }
        ].map(cuisine => {
          const isSelected = (formData.cuisineTypes || []).includes(cuisine.value);
          
          return (
            <label
              key={cuisine.value}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    cuisineTypes: e.target.checked
                      ? [...(prev.cuisineTypes || []), cuisine.value]
                      : (prev.cuisineTypes || []).filter(c => c !== cuisine.value)
                  }));
                }}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-xl">{cuisine.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                {cuisine.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>

    {/* Catering Styles - DSS Field */}
    <div className="form-group">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Service Styles Available
        <span className="text-xs text-gray-500 ml-2">(How do you serve food at events?)</span>
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'buffet', label: 'Buffet Style', desc: 'Self-service buffet stations', icon: '🍱' },
          { value: 'plated', label: 'Plated Service', desc: 'Formal sit-down service', icon: '🍽️' },
          { value: 'family', label: 'Family Style', desc: 'Shared platters at tables', icon: '👨‍👩‍👧‍👦' },
          { value: 'cocktail', label: 'Cocktail Reception', desc: 'Standing appetizers & drinks', icon: '🍸' },
          { value: 'stations', label: 'Food Stations', desc: 'Multiple themed stations', icon: '🏪' },
          { value: 'food_truck', label: 'Food Truck', desc: 'Mobile catering service', icon: '🚚' }
        ].map(style => {
          const isSelected = (formData.cateringStyles || []).includes(style.value);
          
          return (
            <label
              key={style.value}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    cateringStyles: e.target.checked
                      ? [...(prev.cateringStyles || []), style.value]
                      : (prev.cateringStyles || []).filter(s => s !== style.value)
                  }));
                }}
                className="mt-1 w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-2xl">{style.icon}</span>
              <div className="flex-1">
                <div className={`font-medium mb-1 ${isSelected ? 'text-pink-700' : 'text-gray-900'}`}>
                  {style.label}
                </div>
                <div className="text-xs text-gray-500">{style.desc}</div>
              </div>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-pink-500" />
              )}
            </label>
          );
        })}
      </div>
    </div>
  </>
)}
```

---

## 📍 STEP 5: ADDITIONAL SERVICES (ALL CATEGORIES)

### Snippet 5.1: Additional Services Multi-Select

```tsx
{/* Additional Services - DSS Field - Show for ALL categories */}
<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Additional Services & Add-ons
    <span className="text-xs text-gray-500 ml-2">(Optional extras that boost your recommendations)</span>
  </label>
  
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {[
      { value: 'photo_booth', label: 'Photo Booth', icon: '📸' },
      { value: 'live_streaming', label: 'Live Streaming', icon: '📹' },
      { value: 'drone_video', label: 'Drone Videography', icon: '🚁' },
      { value: 'same_day_edit', label: 'Same Day Edit', icon: '🎬' },
      { value: 'album', label: 'Wedding Album', icon: '📖' },
      { value: 'prints', label: 'Photo Prints', icon: '🖼️' },
      { value: 'backup_plan', label: 'Backup Plan (Weather)', icon: '☔' },
      { value: 'coordinator', label: 'Day-of Coordinator', icon: '📋' },
      { value: 'setup_teardown', label: 'Setup & Teardown', icon: '🔧' },
      { value: 'decorations', label: 'Decorations Included', icon: '🎀' },
      { value: 'transport', label: 'Transportation', icon: '🚗' },
      { value: 'accommodation', label: 'Accommodation Packages', icon: '🏨' }
    ].map(service => {
      const isSelected = (formData.additionalServices || []).includes(service.value);
      
      return (
        <label
          key={service.value}
          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            isSelected
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 bg-white hover:border-pink-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                additionalServices: e.target.checked
                  ? [...(prev.additionalServices || []), service.value]
                  : (prev.additionalServices || []).filter(s => s !== service.value)
              }));
            }}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
          />
          <span className="text-lg">{service.icon}</span>
          <span className={`text-sm ${isSelected ? 'text-pink-700 font-medium' : 'text-gray-700'}`}>
            {service.label}
          </span>
        </label>
      );
    })}
  </div>
  
  {(formData.additionalServices || []).length > 0 && (
    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <p className="text-sm text-purple-700">
        <Sparkles className="w-4 h-4 inline mr-1" />
        <strong>Value added!</strong> Offering {(formData.additionalServices || []).length} additional service{(formData.additionalServices || []).length !== 1 ? 's' : ''} makes your package more attractive!
      </p>
    </div>
  )}
</div>
```

---

## 🎯 IMPLEMENTATION NOTES

### Where to Add Each Snippet

1. **Priority 1 Fields (Snippets 1.1-1.3):**
   - Add after the location field in Step 1
   - Around line 800-900 in AddServiceForm.tsx

2. **Wedding Styles (Snippets 2.1-2.2):**
   - Create new Step 2 for Style & Preferences
   - Insert between current Step 1 and Step 2
   - Update `totalSteps` variable

3. **Venue Fields (Snippet 3.1):**
   - Add after Step 1 or in Step 2
   - Wrapped in conditional: `{formData.category === 'Venue' && ...}`

4. **Catering Fields (Snippet 4.1):**
   - Add after Venue fields
   - Wrapped in conditional: `{formData.category === 'Catering' && ...}`

5. **Additional Services (Snippet 5.1):**
   - Add in Step 3 or Step 4
   - No conditional - show for ALL categories

---

## 📝 FINAL CHECKLIST

After adding all snippets:

- [ ] All imports are present (CheckCircle2, Sparkles, AlertTriangle, etc.)
- [ ] State variables match formData structure
- [ ] Conditional rendering works for venue/catering
- [ ] Form validates before submission
- [ ] API payload includes all DSS fields
- [ ] Testing completed successfully
- [ ] Code committed to Git

---

**That's it! Copy-paste these snippets and you're done! 🎉**

**Estimated Time:** 4-6 hours  
**Difficulty:** Easy (just copy-paste and test)  
**Impact:** Huge (DSS recommendations become 10x more accurate!)
