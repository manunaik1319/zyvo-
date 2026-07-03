# Critical Layout Rules & Global UI Standards (Mandatory)

These rules are **non-negotiable** and apply to every screen created or modified in the Zyvo application.

## 1. Safe Area & Device Compatibility
- **No Overlap**: The UI **must never** overlap with the Dynamic Island, iPhone Notch, Status Bar, Camera Cutout, Android Punch Hole, or Home Indicator.
- **SafeAreaView Enforcement**: Wrap the entire screen using `<SafeAreaView edges={["top", "bottom"]}>` or `react-native-safe-area-context`. The screen content must start **inside the safe area**, never behind it.
- **Status Bar**: Keep the status bar completely visible. Never cover the Time, Network, Battery, or Signal indicators.

## 2. Header Position & Dynamic Island Clearance
- **Position**: The header must begin **below the safe area**. Do NOT place any text or icons at the top edge.
- **Top Padding**: Safe Area Top Padding must be **50–60px (minimum on iPhone with Dynamic Island)**.
- **Dimensions**: Header Height: **64px** | Horizontal Padding: **24px** | Gap below header: **24px**.
- **Centering**: The page title must be vertically centered inside the header.
- **Dynamic Island Clearance**: Never place page titles, search bars, back buttons, profile avatars, filter buttons, statistics, or cards behind or underneath the Dynamic Island. Maintain at least **20px clearance** from the Dynamic Island.

```
┌────────────────────────────────────┐
│      Safe Area (Notch Area)        │
├────────────────────────────────────┤
│ ← Back      Booking History     🔍 │
├────────────────────────────────────┤
│                                    │
│        Screen Content              │
│                                    │
└────────────────────────────────────┘
```

## 3. Auto Layout & Responsive Rules
- **Flexbox Only**: Every component must use responsive layouts. Never use fixed absolute positioning for Headers, Titles, Navigation, or Search bars. Use Flexbox only.
- **Responsiveness**: The UI must automatically adapt to iPhone SE, iPhone 13/14/15/16 Pro, Android devices, and Tablets without overlapping.

## 4. Bottom Navigation Safe Area
- **Positioning**: Navigation must float above the Home Indicator.
- **Bottom Padding**: Respect bottom safe area padding exactly: **34px on iOS** and **16px on Android** (`bottom: Platform.OS === 'ios' ? 34 : 16`).

## 5. Unified Design System & Palette
Maintain identical aesthetics to the Home Dashboard:
- Background: `#FAFAFA` with large blurred Indigo gradient (`#6366F1`) top-left and Cyan gradient (`#06B6D4`) bottom-right.
- Primary: `#6366F1` | Secondary: `#06B6D4` | Success: `#22C55E` | Warning: `#F59E0B` | Danger: `#EF4444` | Text: `#111827`.

## 6. Card Design
- Border Radius: **24px** | White surface (`#FFFFFF`) | Border: `#F1F5F9` | Soft layered shadow | Internal padding: **20–24px** | Spacing: **20–24px**.

## 7. Validation Checklist
Before completing any design or screen edit, verify:
✅ No overlap with Dynamic Island
✅ No overlap with Status Bar
✅ No overlap with Home Indicator
✅ Header fully visible below safe area
✅ Title perfectly centered
✅ Icons aligned and Search bar below header
✅ Responsive on all devices
