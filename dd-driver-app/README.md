# DD DRIVER - iOS App

A minimalist ride-sharing app designed to provide a safe, door-to-door solution for getting you and your car home safely. DD Driver arrives on an e-bike, stores it in your trunk, drives your car to your destination, and then leaves on their e-bike.

## Features

### 🚗 Request a Ride
- Interactive map interface to view your location
- Easy pickup location input ("Where is your car?")
- Dropoff location selection
- Estimated time and pricing
- Smooth animations and minimalist design

### 👤 User Profile
- View your total rides taken
- Check your rating
- Manage account information
- Access ride history
- Manage payment methods
- Save favorite locations

### 📖 How to Use
- Complete guide on how the service works
- Step-by-step instructions
- Safety tips
- 24/7 support access

## Design

### Color Scheme
- **Primary Color**: `#5ABAEA` (Bright Blue)
- **Background Color**: `#D7DEED` (Light Blue/Gray)
- **White**: `#FFFFFF` for cards and components

### Typography
- **Font Family**: Lexend (Google Fonts)
  - Light (300)
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)

### Design Principles
- Minimalist interface
- Smooth, sleek animations
- Clean, modern UI
- Intuitive navigation
- Accessibility-focused

## Technology Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Bottom Tabs)
- **Maps**: React Native Maps
- **Fonts**: Expo Google Fonts (Lexend)
- **Icons**: Expo Vector Icons (Ionicons)
- **Gradients**: Expo Linear Gradient

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd dd-driver-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on iOS:
   ```bash
   npm run ios
   ```
   *Note: Requires macOS and Xcode*

6. Run on Android:
   ```bash
   npm run android
   ```

7. Run on Web:
   ```bash
   npm run web
   ```

## Configuration

### Google Maps API
To enable map functionality, you need to add your Google Maps API key:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `app.json`:
   - For iOS: `expo.ios.config.googleMapsApiKey`
   - For Android: `expo.android.config.googleMaps.apiKey`

## Project Structure

```
dd-driver-app/
├── screens/
│   ├── RequestRideScreen.js    # Main ride request interface
│   ├── ProfileScreen.js         # User profile and stats
│   └── HowToUseScreen.js        # Service information and guide
├── assets/                      # Images and icons
├── App.js                       # Main app entry with navigation
├── app.json                     # Expo configuration
└── package.json                 # Dependencies
```

## Screens

### Request Ride Screen
- Map view with location marker
- Bicycle icon and branding
- Pickup location input with icon
- Dropoff location input with icon
- Estimated time and price display
- Request button with gradient background

### Profile Screen
- User avatar and name
- Member since information
- Statistics cards (total rides, rating, saved places)
- Account information (email, phone, verification)
- Quick actions (ride history, payment, saved locations, support)

### How to Use Screen
- Hero section with service description
- 5-step guide with icons and colors
- Features list (verified drivers, 24/7, ratings, etc.)
- Safety tips
- Contact support options

## Service Description

"We are here to get you home safe. Our service provides a door-to-door solution to drunk driving. Simply request a DD Driver who will arrive on an e-bike to your car's location, they will fold their ebike into the trunk of your car, pick you up and drive your car to your home location, then retrieve their ebike and head home."

## Future Enhancements

- Real-time driver tracking
- In-app payment processing
- Push notifications
- Ride history with detailed views
- Favorite locations management
- Multiple payment methods
- Driver ratings and reviews
- Emergency contact features
- Trip sharing functionality

## License

Copyright © 2024 DD DRIVER. All rights reserved.
