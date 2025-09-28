const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://weddingbazaar-web.web.app', 'https://weddingbazaar-4171e.web.app'],
  credentials: true
}));
app.use(express.json());

// Dynamic user creation based on real login
const mockUsers = [];

// Helper function to create real user from email
function createRealUser(email) {
  const emailParts = email.split('@')[0].split('.');
  const firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : 'User';
  const lastName = emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : '';
  
  return {
    id: String(mockUsers.length + 1),
    email: email,
    password: 'demo',
    firstName: firstName,
    lastName: lastName,
    role: 'couple'
  };
}

const mockServices = Array.from({ length: 90 }, (_, i) => ({
  id: `service-${i + 1}`,
  name: `Wedding Service ${i + 1}`,
  category: ['Photography', 'Catering', 'Venue', 'Music', 'Planning', 'Florist'][i % 6],
  price: Math.floor(Math.random() * 5000) + 500,
  rating: (4 + Math.random()).toFixed(1),
  image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop'
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Local backup server running',
    services: mockServices.length,
    timestamp: new Date().toISOString() 
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email required' });
  }
  
  // Find existing user or create new one
  let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // Create real user based on email
    user = createRealUser(email);
    mockUsers.push(user);
    console.log(`✅ Created new user: ${user.firstName} ${user.lastName} (${user.email})`);
  }
  
  res.json({
    success: true,
    token: 'local-token-' + Date.now(),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

app.post('/api/auth/verify', (req, res) => {
  res.json({ 
    success: true, 
    authenticated: true, 
    user: mockUsers[0] 
  });
});

// Services endpoint
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: mockServices,
    total: mockServices.length
  });
});

// Vendors endpoint
app.get('/api/vendors/featured', (req, res) => {
  res.json({
    success: true,
    vendors: [
      { id: '1', name: 'Elite Photography', category: 'Photography', rating: 4.8 },
      { id: '2', name: 'Perfect Catering', category: 'Catering', rating: 4.6 },
      { id: '3', name: 'Dream Venues', category: 'Venue', rating: 4.9 }
    ]
  });
});

// Conversations endpoint
app.get('/api/conversations/:userId', (req, res) => {
  const conversations = [
    {
      id: 'conv-1',
      participants: [
        { id: '1', name: 'Sarah Johnson', role: 'couple' },
        { id: '2', name: 'David Martinez', role: 'vendor', businessName: 'Elite Photography' }
      ],
      lastMessage: {
        id: 'msg-1',
        content: 'Thank you for your interest in our photography services!',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    conversations: conversations,
    total: conversations.length,
    userId: req.params.userId
  });
});

// Bookings endpoint
app.get('/api/bookings/:userId', (req, res) => {
  res.json({
    success: true,
    bookings: [],
    total: 0
  });
});

app.post('/api/bookings', (req, res) => {
  res.json({
    success: true,
    booking: { id: 'booking-' + Date.now(), ...req.body },
    message: 'Booking created successfully'
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Local backup server running on http://localhost:${PORT}`);
  console.log(`🎯 This will allow you to test login and features while Render backend is down`);
  console.log(`📊 Services available: ${mockServices.length}`);
  console.log(`📧 Login with: sarah.johnson@email.com / any password`);
});
