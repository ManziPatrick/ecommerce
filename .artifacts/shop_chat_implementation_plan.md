# Shop Chat System Implementation Plan

## Overview
Implement a real-time chat system where customers can communicate directly with shop vendors, with admin oversight and real-time notifications.

## Features
1. **Customer-to-Shop Chat**: Customers can initiate chats with specific shops from product pages
2. **Vendor Dashboard**: Shop owners see all their customer chats
3. **Admin Oversight**: Admins/Superadmins can view all shop chats across the platform
4. **Real-time Notifications**: Sound + popup alerts for new messages and orders
5. **Read Status Tracking**: Track which messages have been read

## Database Schema Changes ✅
- Added `shopId` to Chat model (links chat to specific shop)
- Added `isRead` to ChatMessage model (notification tracking)
- Added `chats` relation to Shop model

## Backend Implementation

### 1. Update Chat Service
- [ ] Add `createShopChat(userId, shopId)` method
- [ ] Add `getShopChats(shopId)` method for vendors
- [ ] Add `getAllShopChats()` method for admins
- [ ] Add `markMessagesAsRead(chatId, userId)` method
- [ ] Update `sendMessage` to emit socket events with shop context

### 2. Update Chat Controller
- [ ] Add `createShopChat` endpoint
- [ ] Add `getShopChats` endpoint (vendor-only)
- [ ] Add `getAllShopChats` endpoint (admin-only)
- [ ] Add `markAsRead` endpoint

### 3. Socket.IO Events
- [ ] `shop:newMessage` - Emit when new message in shop chat
- [ ] `shop:chatCreated` - Emit when customer starts new shop chat
- [ ] `order:created` - Emit when new order is placed
- [ ] Join rooms: `shop:{shopId}`, `vendor:{userId}`, `admin`

## Frontend Implementation

### 1. Product Page Chat Button
- [ ] Add "Chat with Shop" button on product detail page
- [ ] Opens chat modal/sidebar
- [ ] Shows shop info (logo, name, response time)

### 2. Vendor Dashboard - Chat Tab
- [ ] List all customer chats for vendor's shop
- [ ] Show unread message count
- [ ] Real-time message updates
- [ ] Chat interface with customer info

### 3. Admin Dashboard - All Chats View
- [ ] List all shop chats across platform
- [ ] Filter by shop, status, date
- [ ] View-only mode (can see but not participate)

### 4. Notification System
- [ ] Browser notification permission request
- [ ] Sound notification (ding.mp3)
- [ ] Toast popup with message preview
- [ ] Badge count on chat icon
- [ ] Different sounds for messages vs orders

### 5. Chat UI Components
- [ ] `ShopChatButton` - Trigger on product page
- [ ] `ShopChatModal` - Full chat interface
- [ ] `ChatMessageList` - Message display
- [ ] `ChatInput` - Message composition
- [ ] `NotificationToast` - Popup notification
- [ ] `UnreadBadge` - Count indicator

## API Endpoints

### Customer Endpoints
- `POST /api/v1/chat/shop/:shopId` - Create/get chat with shop
- `POST /api/v1/chat/:chatId/message` - Send message
- `PATCH /api/v1/chat/:chatId/read` - Mark messages as read

### Vendor Endpoints
- `GET /api/v1/chat/shop/my-chats` - Get all chats for vendor's shop
- `GET /api/v1/chat/shop/:shopId/chats` - Get chats for specific shop

### Admin Endpoints
- `GET /api/v1/chat/shop/all` - Get all shop chats (admin only)

## Socket.IO Room Structure
```
shop:{shopId}          - All participants in shop chats
vendor:{userId}        - Specific vendor
user:{userId}          - Specific customer
admin                  - All admins/superadmins
```

## Notification Logic
1. **New Message**: 
   - Play sound
   - Show toast with sender name + preview
   - Update unread badge
   - Browser notification if tab inactive

2. **New Order**:
   - Different sound (more prominent)
   - Show toast with order details
   - Highlight in vendor dashboard

## Security Considerations
- Customers can only see their own chats
- Vendors can only see chats for their shops
- Admins can see all chats (read-only)
- Rate limiting on message sending
- Content moderation flags

## Next Steps
1. ✅ Update Prisma schema
2. Run migration
3. Update backend services
4. Create frontend components
5. Implement Socket.IO events
6. Add notification system
7. Test end-to-end flow
