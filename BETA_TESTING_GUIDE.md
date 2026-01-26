Zariel & Co Platform - Beta Testing Guide
═══════════════════════════════════════════

TABLE OF CONTENTS
─────────────────
1. Introduction
2. Test Account Setup
3. Creator Account Testing
4. Company Account Testing
5. Admin Account Testing
6. Cross-Account Testing
7. Bug Reporting Template

═══════════════════════════════════════════

INTRODUCTION
─────────────

Purpose: This guide ensures all features of the Zariel & Co platform are thoroughly tested across all user roles.

Testing Environment: Production/Staging URL

Test Duration: Recommended 2-3 hours per role

What You'll Need:
• Email addresses for test accounts (Creator, Company, Admin)
• Stripe test card: 4242 4242 4242 4242 (Any future date, Any 3-digit CVC)
• Notepad for bug tracking
• Screenshots for any issues found

═══════════════════════════════════════════

TEST ACCOUNT SETUP
──────────────────

1. Create Test Accounts

CREATOR ACCOUNT (TIER 1) 
1. Navigate to the signup page
2. Click "Sign Up"
3. Fill in:
   - Email: creator-test@yourdomain.com
   - Password: Test123!
   - Full Name: Test Creator
   - Select Role: Creator
4. Verify email if required
5. ✅ **Expected:** Successfully logged in to Creator dashboard

#### Company Account Tier 2 and Tier 3
1. Log out from Creator account
2. Navigate to signup page
3. Fill in:
   - Email: company-test@yourdomain.com
   - Password: Test123!
   - Full Name: Test Company
   - Select Role: Company
4. Verify email if required
5. ✅ **Expected:** Successfully logged in to Company dashboard

#### Admin Account FTE email holders only
1. Log out from Company account
2. Navigate to signup page
3. Fill in:
   - Email: admin-test@yourdomain.com
   - Password: Test123!
   - Full Name: Test Admin
   - Select Role: Creator or Company (will upgrade to admin via database)
4. Go to Supabase Dashboard → Table Editor → profiles
5. Find the admin-test account and set:
   - `is_admin`: true
   - `role`: admin (if applicable)
6. Log out and log back in
7. ✅ **Expected:** Admin features visible in dashboard

---

## Creator Account Testing

**Login :** Login in after creating a creator account

### 1. Dashboard Overview
- [ ] Dashboard loads without errors
- [ ] User name displays correctly in sidebar
- [ ] Token balance shows (should be 0 initially)
- [ ] Role displays as "Creator"
- [ ] All navigation items visible:
  - Dashboard
  - Marketplace
  - Services
  - Booking Requests
  - My Bookings
  - My Content
  - Content Bids
  - My Purchases
  - Subscription
  - Token Management

T
### 3. Content Upload & Management
1. Navigate to "My Content"
2. Click "Upload Content"
3. Fill in:
   - Title: "Test Video Content"
   - Description: "This is a test upload"
   - Content Type: Video
   - Content URL: https://example.com/test-video.mp4
   - Thumbnail URL: https://example.com/thumbnail.jpg
   - Price: 500 ZARYO
4. Click "Upload Content"
5. ✅ **Expected:** Content appears in "My Content" list
6. ✅ **Expected:** Status shows "Active"
7. Test editing content:
   - Click on the content card
   - Update price to 600 ZARYO
   - Save changes
8. ✅ **Expected:** Price updates successfully
9. Test archiving content
10. ✅ **Expected:** Status changes to "Archived"

### 4. Content Bids Management
1. Navigate to "Content Bids"
2. ✅ **Expected:** See list of content you've uploaded
3. ✅ **Expected:** See any bids placed by companies (will be empty initially)
4. (Will test accepting bids in Cross-Account Testing section)

1F

### 6. Marketplace Browsing
1. Navigate to "Marketplace"
2. ✅ **Expected:** See all active content from all creators
3. ✅ **Expected:** Can search content by title
4. Test filters (if any)
5. Click on a content card
6. ✅ **Expected:** Content details visible
7. ✅ **Expected:** Cannot purchase own content (if you see your own)

### 7. Services Marketplace
1. Navigate to "Services"
2. Click "Post Service"
3. Fill in:
   - Title: "Photography Services"
   - Category: Photographer
   - Description: "Professional photography for events"
   - Price Type: Hourly
   - Price: 1000 ZARYO
   - Location: New York, NY
   - Availability: Mon-Fri 9AM-5PM
4. Click "Post Service"
5. ✅ **Expected:** Service appears in marketplace
6. ✅ **Expected:** Shows "Your Service" button (disabled)
7. Search for services
8. ✅ **Expected:** Search filters work correctly

### 8. Service Bookings (as Provider)
1. Navigate to "Booking Requests"
2. ✅ **Expected:** Page loads (empty initially)
3. (Will test receiving bookings in Cross-Account Testing)

### 9. My Bookings (as Customer)
1. Navigate to "My Bookings"
2. ✅ **Expected:** Page loads (empty initially)
3. (Will test booking services in Cross-Account Testing)

### 10. Account Settings
1. Click "Settings" in sidebar
2. Update profile:
   - Full Name: "Updated Creator Name"
   - Bio: "Test creator bio"
3. Click "Save Changes"
4. ✅ **Expected:** Profile updates successfully
5. ✅ **Expected:** Name updates in sidebar

### 11. Logout
1. Click "Logout"
2. ✅ **Expected:** Redirected to login page
3. ✅ **Expected:** Cannot access dashboard without login

---

## Company Account Testing

**Login as:** company-test@yourdomain.com

### 1. Dashboard Overview
- [ ] Dashboard loads without errors
- [ ] User name displays correctly
- [ ] Token balance shows (should be 0 initially)
- [ ] Role displays as "Company"
- [ ] Navigation items visible:
  - Dashboard
  - Marketplace
  - Services
  - Booking Requests
  - My Bookings
  - My Content
  - My Purchases
  - Subscription
  - Token Management
- [ ] "Content Bids" should NOT be visible (Creator only)

### 2. Token Purchase
1. Navigate to "Token Management"
2. Purchase 5000 ZARYO tokens (will need for testing)
3. Complete Stripe payment
4. ✅ **Expected:** Balance shows 5000 ZARYO
5. ✅ **Expected:** Transaction logged

### 3. Content Marketplace & Bidding
1. Navigate to "Marketplace"
2. Find content uploaded by test creator
3. ✅ **Expected:** See "Buy Now" and "Place Bid" buttons
4. Click "Place Bid"
5. Fill in:
   - Bid Amount: 300 ZARYO
   - Message: "Interested in this content"
6. Click "Place Bid"
7. ✅ **Expected:** Bid submitted successfully
8. ✅ **Expected:** Token balance decreases by 300 ZARYO
9. ✅ **Expected:** Transaction shows in Token Management

### 4. Content Purchase
1. In Marketplace, find content with price 600 ZARYO
2. Click "Buy Now"
3. Confirm purchase dialog
4. Click "Confirm Purchase"
5. ✅ **Expected:** Purchase successful
6. ✅ **Expected:** Balance decreases by 600 ZARYO
7. ✅ **Expected:** Content now in "My Purchases"

### 5. My Purchases
1. Navigate to "My Purchases"
2. ✅ **Expected:** See purchased content
3. ✅ **Expected:** Can view/access content
4. ✅ **Expected:** Shows purchase date and amount

### 6. Services Booking
1. Navigate to "Services"
2. Find service posted by test creator
3. Click "Book Service"
4. Fill in:
   - Booking Date: Tomorrow's date
   - Duration: 2 hours
   - Message: "Need photography for event"
5. Click "Send Booking Request"
6. ✅ **Expected:** Request sent successfully
7. ✅ **Expected:** NO payment made yet (pending confirmation)

### 7. My Bookings (Customer View)
1. Navigate to "My Bookings"
2. ✅ **Expected:** See pending booking request
3. ✅ **Expected:** Status shows "Pending"
4. ✅ **Expected:** Shows service details, date, duration
5. ✅ **Expected:** No payment button yet (awaiting confirmation)

### 8. Services Posting (Company can also post)
1. Navigate to "Services"
2. Click "Post Service"
3. Fill in:
   - Title: "Studio Rental"
   - Category: Studio Rental
   - Description: "Professional recording studio"
   - Price Type: Daily
   - Price: 5000 ZARYO
   - Location: Los Angeles, CA
4. ✅ **Expected:** Service posted successfully

### 9. Booking Requests (as Provider)
1. Navigate to "Booking Requests"
2. ✅ **Expected:** Empty initially (unless creator booked your service)

### 10. Company Tier Features
1. Check if company tier affects bidding
2. ✅ **Expected:** All companies can bid regardless of tier
3. Test tier-specific features if any exist

---

## Admin Account Testing

**Login as:** admin-test@yourdomain.com

### 1. Dashboard Overview
- [ ] Dashboard loads without errors
- [ ] Admin-specific features visible
- [ ] Can see all users' data (if admin dashboard exists)
- [ ] Role displays as "Admin"

### 2. Content Moderation
1. Navigate to "Marketplace"
2. ✅ **Expected:** Can view all content
3. Test admin-specific actions:
   - Archive any content
   - Unarchive content
   - View all content regardless of status

### 3. User Management (if implemented)
1. Access user management panel
2. ✅ **Expected:** See all registered users
3. ✅ **Expected:** Can view user details
4. Test actions:
   - Update user roles
   - Suspend accounts
   - View user activity

### 4. Token Issuance
1. Navigate to "Token Management"
2. Check if admin can issue tokens
3. Test issuing tokens to users:
   - Select a user
   - Enter amount
   - Add reason
4. ✅ **Expected:** Tokens added to user account
5. ✅ **Expected:** Transaction logged as "issuance"

### 5. Subscription Management
1. Check if admin can view all subscriptions
2. ✅ **Expected:** See all active/cancelled subscriptions
3. Test admin actions:
   - Cancel any subscription
   - Extend subscription period
   - View subscription analytics

### 6. Service Moderation
1. Navigate to "Services"
2. ✅ **Expected:** Can view all services
3. Test admin actions:
   - Pause/unpause services
   - Remove inappropriate services
   - View all bookings

### 7. Financial Overview (if exists)
1. Check if admin dashboard shows:
   - Total tokens in circulation
   - Total revenue
   - Active subscriptions count
   - Transaction volume
2. ✅ **Expected:** Analytics display correctly

### 8. Admin-only Features
- [ ] Test any admin-specific tools
- [ ] Verify regular users cannot access admin features
- [ ] Check admin audit logs (if implemented)

---

## Cross-Account Testing

### Scenario 1: Content Bidding Flow (Company → Creator)

**As Company:**
1. Log in as company-test@yourdomain.com
2. Navigate to Marketplace
3. Find content from test creator
4. Place bid: 400 ZARYO with message
5. ✅ **Expected:** Bid placed, tokens deducted

**As Creator:**
1. Log out, log in as creator-test@yourdomain.com
2. Navigate to "Content Bids"
3. ✅ **Expected:** See bid from company-test
4. ✅ **Expected:** Shows bid amount (400 ZARYO)
5. ✅ **Expected:** Shows company message
6. Click "Accept Bid"
7. ✅ **Expected:** Bid accepted
8. ✅ **Expected:** Tokens transferred to creator
9. ✅ **Expected:** Content status changes to "Sold"

**As Company:**
1. Log back in as company
2. Navigate to "My Purchases"
3. ✅ **Expected:** Content now appears in purchases
4. ✅ **Expected:** Can access the content

### Scenario 2: Service Booking Flow (Company → Creator)

**As Company:**
1. Log in as company-test@yourdomain.com
2. Navigate to "Services"
3. Find service from creator (Photography Services)
4. Click "Book Service"
5. Fill in booking details:
   - Date: Tomorrow
   - Duration: 3 hours
   - Message: "Need photographer for product shoot"
6. Send booking request
7. ✅ **Expected:** Request sent, NO payment yet

**As Creator:**
1. Log in as creator-test@yourdomain.com
2. Navigate to "Booking Requests"
3. ✅ **Expected:** See booking request from company
4. ✅ **Expected:** Shows all booking details
5. ✅ **Expected:** Shows "Accept" and "Decline" buttons
6. Click "Accept"
7. ✅ **Expected:** Status changes to "Confirmed"
8. ✅ **Expected:** Shows "Waiting for customer to complete payment"

**As Company:**
1. Log back in as company
2. Navigate to "My Bookings"
3. ✅ **Expected:** Booking status is "Confirmed"
4. ✅ **Expected:** See "Pay X ZARYO" button
5. ✅ **Expected:** Shows total cost (1000 ZARYO/hr × 3hrs = 3000 ZARYO)
6. Click "Pay 3000 ZARYO"
7. ✅ **Expected:** Payment successful
8. ✅ **Expected:** Balance decreases by 3000 ZARYO
9. ✅ **Expected:** Status changes to "Paid"

**As Creator:**
1. Log back in as creator
2. Navigate to "Booking Requests"
3. Check "Confirmed" tab
4. ✅ **Expected:** Booking shows as "Paid"
5. ✅ **Expected:** Token balance increased by 3000 ZARYO
6. Click "Mark as Completed"
7. ✅ **Expected:** Status changes to "Completed"

### Scenario 3: Insufficient Tokens

**As Company:**
1. Log in as company (should have spent most tokens by now)
2. Try to purchase content that costs more than balance
3. ✅ **Expected:** Error message: "Insufficient tokens"
4. Try to pay for a confirmed booking without enough tokens
5. Click "Pay X ZARYO"
6. ✅ **Expected:** Toast notification: "Insufficient Tokens - You need X but only have Y"
7. Navigate to Token Management
8. Purchase more tokens
9. Return and complete payment
10. ✅ **Expected:** Payment now succeeds

### Scenario 4: Service Provider Declining Booking

**As Company:**
1. Book another service from creator
2. Send booking request

**As Creator:**
1. Navigate to "Booking Requests"
2. Click "Decline" on the request
3. ✅ **Expected:** Status changes to "Cancelled"
4. ✅ **Expected:** No tokens transferred

**As Company:**
1. Navigate to "My Bookings"
2. Check "Cancelled" tab
3. ✅ **Expected:** Booking appears there
4. ✅ **Expected:** Shows "This booking was cancelled"

### Scenario 5: Multiple Bids on Same Content

**As Company (account 1):**
1. Place bid of 350 ZARYO on creator's content

**As Admin (acting as another company):**
1. Place bid of 450 ZARYO on same content

**As Creator:**
1. Navigate to "Content Bids"
2. ✅ **Expected:** See both bids
3. ✅ **Expected:** Bids sorted by amount or date
4. Accept the higher bid (450 ZARYO)
5. ✅ **Expected:** Other bid automatically rejected/refunded

**As Company (account 1):**
1. Check Token Management
2. ✅ **Expected:** 350 ZARYO refunded
3. ✅ **Expected:** Transaction shows "bid_refund"

---

## Edge Cases & Error Testing

### 1. Session & Authentication
- [ ] Try accessing dashboard without login → Redirected to login
- [ ] Try accessing admin features as non-admin → Access denied
- [ ] Test session timeout behavior
- [ ] Test login with wrong password → Error message
- [ ] Test signup with existing email → Error message

### 2. Form Validation
- [ ] Submit content upload with empty fields → Validation errors
- [ ] Submit bid with amount = 0 → Error
- [ ] Submit booking without date → Validation error
- [ ] Submit service with negative price → Error
- [ ] Upload content with invalid URL format → Error

### 3. Payment Edge Cases
- [ ] Try to purchase own content → Button disabled
- [ ] Try to book own service → Button disabled
- [ ] Try to accept own bid → Should not be possible
- [ ] Test Stripe payment failure handling
- [ ] Cancel Stripe checkout midway → No charges

### 4. Concurrent Actions
- [ ] Two companies bid on same content simultaneously
- [ ] Creator accepts bid while another company is viewing
- [ ] Service booked while owner is editing it
- [ ] Content purchased while creator is editing price

### 5. Data Integrity
- [ ] Refresh page during bid submission → Check for duplicates
- [ ] Network interruption during payment → Check token balance consistency
- [ ] Logout during transaction → Transaction should complete or rollback properly
- [ ] Browser back button after purchase → No double purchase

### 6. Real-time Updates
- [ ] Open "Content Bids" in two windows (as creator)
- [ ] Have company place bid
- [ ] ✅ **Expected:** New bid appears in both windows without refresh
- [ ] Accept bid in one window
- [ ] ✅ **Expected:** Both windows update to show accepted status

### 7. Search & Filters
- [ ] Search with special characters
- [ ] Search with very long string
- [ ] Filter with no results → Shows "No content found"
- [ ] Clear filters → Shows all content

### 8. File Uploads (if applicable)
- [ ] Try uploading very large file → Size limit error
- [ ] Try uploading wrong file type → Format error
- [ ] Test image upload for service thumbnails
- [ ] Test profile picture upload

---

## Performance Testing

### 1. Load Testing
- [ ] Load marketplace with 100+ items
- [ ] ✅ **Expected:** Page loads within 3 seconds
- [ ] Scroll through long lists
- [ ] ✅ **Expected:** Smooth scrolling, no lag

### 2. Mobile Responsiveness
- [ ] Test on mobile device (or browser dev tools mobile view)
- [ ] Check all pages are responsive
- [ ] Test sidebar menu on mobile
- [ ] Test forms on mobile
- [ ] Test payment flow on mobile

### 3. Browser Compatibility
- [ ] Test on Chrome
- [ ] Test on Safari
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Check for any browser-specific issues

---

## Bug Reporting Template

When you find an issue, please document it with the following information:

**Bug Report #[Number]**

**Priority:** Critical / High / Medium / Low

**User Role:** Creator / Company / Admin

**Page/Feature:** (e.g., Marketplace, Token Management)

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
Describe what should happen

**Actual Behavior:**
Describe what actually happened

**Screenshots:**
Attach relevant screenshots

**Console Errors:**
Copy any error messages from browser console (F12 → Console)

**Browser & Device:**
- Browser: Chrome 120
- Device: MacBook Pro
- OS: macOS 14.0

**Additional Notes:**
Any other relevant information

---

## Testing Checklist Summary

### Creator Account
- [ ] Dashboard loads
- [ ] Subscription purchase
- [ ] Content upload
- [ ] Content editing
- [ ] Content bids management
- [ ] Accept/reject bids
- [ ] Token purchase
- [ ] Service posting
- [ ] Receive booking requests
- [ ] Accept/decline bookings
- [ ] Mark bookings completed
- [ ] Book other services
- [ ] Pay for confirmed bookings

### Company Account
- [ ] Dashboard loads
- [ ] Token purchase
- [ ] Browse marketplace
- [ ] Place bids
- [ ] Purchase content
- [ ] View purchased content
- [ ] Book services
- [ ] Pay for confirmed bookings
- [ ] Post services
- [ ] Receive booking requests

### Admin Account
- [ ] Dashboard loads
- [ ] View all users
- [ ] Content moderation
- [ ] Service moderation
- [ ] Token issuance
- [ ] Subscription management
- [ ] Analytics viewing
- [ ] Admin-only features

### Cross-Account Flows
- [ ] Bid → Accept → Purchase flow
- [ ] Book → Confirm → Pay → Complete flow
- [ ] Multiple bids on same content
- [ ] Bid rejection and refund
- [ ] Service booking cancellation

### Technical Tests
- [ ] Real-time updates work
- [ ] All forms validate properly
- [ ] Error messages clear and helpful
- [ ] Loading states show correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No broken images/links
- [ ] All navigation works

---

## Post-Testing Actions

After completing all tests:

1. **Compile Bug List**
   - Categorize by priority
   - Group similar issues
   - Include reproduction steps for all

2. **Test Data Cleanup**
   - Document or delete test accounts
   - Clear test transactions if needed
   - Reset any modified settings

3. **Documentation Review**
   - Note any confusing UI elements
   - Suggest UX improvements
   - Identify missing features

4. **Performance Notes**
   - Document slow-loading pages
   - Note any lag or delays
   - Identify optimization opportunities

5. **Submit Feedback**
   - Share bug reports
   - Provide improvement suggestions
   - Highlight what worked well

---

## Success Criteria

The platform is ready for production when:

✅ All critical features work without errors
✅ All payment flows complete successfully
✅ Real-time updates function correctly
✅ No security vulnerabilities found
✅ Mobile experience is functional
✅ No data loss or corruption occurs
✅ All user roles have appropriate access
✅ Error messages are clear and helpful
✅ Performance is acceptable (<3s page loads)
✅ All cross-account workflows complete properly

---

**Testing Team:** Please initial each section as you complete it and report any issues immediately.

**Test Date:** __________
**Tester Name:** __________
**Completion Time:** __________

**Overall Assessment:** Pass / Fail / Needs Revision

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
