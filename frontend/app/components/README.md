# UniversalHeader Component

A reusable header component that can be imported and used across all tab screens in your Durianostics app.

## 📁 File Location
`frontend/app/components/UniversalHeader.tsx`

## 🎯 Usage

### Basic Import
```tsx
import UniversalHeader from '../components/UniversalHeader';
```

## 🔧 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Custom title for the header (overrides navigation) |
| `showBackButton` | `boolean` | `false` | Show back button instead of logo |
| `showNotifications` | `boolean` | `true` | Show notifications bell |
| `backgroundColor` | `string` | `'#fff'` | Header background color |
| `onBackPress` | `() => void` | `undefined` | Function to call when back button is pressed |

## 📱 Usage Examples

### 1. Default Header (with navigation)
```tsx
import UniversalHeader from '../components/UniversalHeader';

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <UniversalHeader />
      <ScrollView style={{ flex: 1 }}>
        {/* Your content here */}
      </ScrollView>
    </View>
  );
}
```

### 2. Header with Custom Title
```tsx
export default function Scanner() {
  return (
    <View style={{ flex: 1 }}>
      <UniversalHeader 
        title="Scanner"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1 }}>
        {/* Scanner content */}
      </ScrollView>
    </View>
  );
}
```

### 3. Header with Custom Styling
```tsx
export default function Analytics() {
  return (
    <View style={{ flex: 1 }}>
      <UniversalHeader 
        title="Analytics Dashboard"
        showBackButton={true}
        backgroundColor="#f8f9fa"
        showNotifications={false}
      />
      <ScrollView style={{ flex: 1 }}>
        {/* Analytics content */}
      </ScrollView>
    </View>
  );
}
```

## 🎨 Header Modes

### Navigation Mode (Default)
- Shows Durianostics logo on the left
- Shows horizontal navigation tabs in center
- Shows notifications bell on right
- Automatically highlights current screen

### Title Mode
- Shows back button on left (if `showBackButton={true}`)
- Shows custom title in center
- Shows notifications on right (if `showNotifications={true}`)

## 📱 Mobile Features

- **Responsive Navigation**: Horizontal scrolling on small screens
- **Touch-Friendly**: Large tap targets optimized for mobile
- **Active States**: Visual feedback for current screen
- **Smooth Transitions**: Clean animations and interactions

## 🔄 Navigation Integration

The header automatically integrates with your `NavigationContext`:
- Detects current screen automatically
- Handles screen navigation when tabs are tapped
- Shows active state for current screen

## 🎯 Best Practices

1. **Use Default for Main Screens**: Home, Forum, Profile, etc.
2. **Use Title Mode for Detail Screens**: Scanner results, Analytics details, etc.
3. **Consistent Back Navigation**: Always provide `onBackPress` when using back button
4. **Custom Colors**: Match your app theme with `backgroundColor` prop

## 📱 Current Navigation Items

- 🏠 Home
- 📷 Scanner  
- 📊 Analytics
- 💬 Forum
- 👤 Profile

## 🚀 Quick Setup

To use in any tab screen:

1. Import the component
2. Add it at the top of your screen
3. Wrap your content in a View/ScrollView
4. Customize props as needed

```tsx
import UniversalHeader from '../components/UniversalHeader';

export default function YourScreen() {
  return (
    <View style={{ flex: 1 }}>
      <UniversalHeader />
      <ScrollView style={{ flex: 1 }}>
        {/* Your screen content */}
      </ScrollView>
    </View>
  );
}
```

That's it! Your screen now has a consistent, mobile-friendly header navigation. 🎉
