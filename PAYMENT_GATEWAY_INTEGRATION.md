# Payment Gateway Integration - Complete Guide

## Overview
Complete Razorpay payment gateway integration for the CULTURA event booking platform.

---

## Backend Implementation

### 1. **Payment Model** (`/server/models/Payment.js`)
Tracks all payment transactions with the following features:
- ✅ Razorpay order and payment ID tracking
- ✅ Payment status management (created, authorized, captured, refunded, failed)
- ✅ Customer and vendor relations
- ✅ Payment method tracking (UPI, card, wallet, etc.)
- ✅ Error tracking and refund management
- ✅ Optimized indexes for queries

### 2. **Payment Controller** (`/server/controllers/users/payment.controller.js`)

#### Available Endpoints:

**a) Create Payment Order**
- **Route**: `POST /api/payments/create-order`
- **Purpose**: Creates Razorpay order for deposit payment
- **Request Body**:
  ```json
  {
    "bookingId": "booking_id",
    "amount": 5000,
    "currency": "INR"
  }
  ```
- **Response**: Returns Razorpay order details with key_id

**b) Verify Payment**
- **Route**: `POST /api/payments/verify`
- **Purpose**: Verifies Razorpay signature and confirms payment
- **Request Body**:
  ```json
  {
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "razorpaySignature": "signature_xxx",
    "bookingId": "booking_id"
  }
  ```
- **Actions**: 
  - Verifies signature using HMAC SHA256
  - Updates payment status to 'captured'
  - Updates booking status to 'confirmed'
  - Updates booking paymentStatus to 'paid'

**c) Handle Payment Failure**
- **Route**: `POST /api/payments/failure`
- **Purpose**: Records failed payment attempts
- **Request Body**:
  ```json
  {
    "razorpayOrderId": "order_xxx",
    "error": {
      "code": "ERROR_CODE",
      "description": "Error message"
    }
  }
  ```

**d) Get Payment Details**
- **Route**: `GET /api/payments/:paymentId`
- **Purpose**: Fetch specific payment details
- **Access**: Private (requires auth)

**e) Get User Payment History**
- **Route**: `GET /api/payments/user/:userId`
- **Purpose**: Get all payments for a user
- **Query Params**: `page`, `limit`, `status`
- **Access**: Private (requires auth)

**f) Initiate Refund**
- **Route**: `POST /api/payments/refund`
- **Purpose**: Process payment refund
- **Request Body**:
  ```json
  {
    "paymentId": "payment_id",
    "amount": 5000,
    "reason": "Cancellation by customer"
  }
  ```
- **Access**: Private (admin/vendor)

### 3. **Payment Routes** (`/server/routes/users/payment.routes.js`)
All routes are properly configured and registered in server.js

### 4. **Environment Variables** (`/server/.env`)
Required Razorpay credentials:
```env
RAZORPAY_KEY_ID=rzp_test_RNTe8bfLkXBgPa
RAZORPAY_KEY_SECRET=L0jEY4gJ1hlWWn1D6rPrf1cX
```

### 5. **Updated Booking Controller**
- Changed default `paymentStatus` from 'paid' to 'pending'
- Payment status is updated to 'paid' only after successful payment verification
- Booking status changes to 'confirmed' after payment

---

## Frontend Implementation

### 1. **Payment Flow** (`/client/src/pages/SecurePayment.jsx`)

#### Complete Payment Process:
1. **Booking Creation**: Creates booking with `paymentStatus: 'pending'`
2. **Order Creation**: Calls `/api/payments/create-order`
3. **Razorpay Checkout**: Opens Razorpay payment modal
4. **Payment Collection**: User completes payment via Razorpay
5. **Verification**: Calls `/api/payments/verify` with signature
6. **Confirmation**: Updates booking to 'paid' and 'confirmed'

#### Features:
- ✅ Razorpay script loading
- ✅ Multiple payment methods (UPI, Card, Wallet, Net Banking)
- ✅ Payment verification with signature
- ✅ Error handling and retry mechanism
- ✅ Success/failure callbacks
- ✅ User-friendly UI with loading states
- ✅ Automatic redirect after success
- ✅ Payment failure recording

### 2. **Booking Form Integration** (`/client/src/components/ListingDeatilPage/BookingForm.jsx`)
- Collects event date and location
- Calculates 10% deposit amount
- Navigates to `/securepayment/:listingId` with booking data
- Validates user authentication

---

## Payment Flow Diagram

```
1. User fills booking form
   ↓
2. Navigate to /securepayment
   ↓
3. Backend: Create booking (status: pending, paymentStatus: pending)
   ↓
4. Backend: Create Razorpay order
   ↓
5. Frontend: Load Razorpay checkout
   ↓
6. User: Complete payment on Razorpay
   ↓
7. Razorpay: Send payment response
   ↓
8. Backend: Verify signature
   ↓
9. Backend: Update payment & booking (paymentStatus: paid, status: confirmed)
   ↓
10. Frontend: Show success screen
```

---

## Security Features

### Backend:
- ✅ HMAC SHA256 signature verification
- ✅ Environment variables for API keys
- ✅ Payment status validation
- ✅ Duplicate payment prevention
- ✅ Error tracking and logging

### Frontend:
- ✅ Secure HTTPS for Razorpay
- ✅ No API keys exposed (fetched from backend)
- ✅ Payment verification on server side
- ✅ Timeout handling
- ✅ User session validation

---

## Testing the Integration

### 1. **Start Backend Server**
```bash
cd server
npm run dev
```

### 2. **Start Frontend**
```bash
cd client
npm run dev
```

### 3. **Test Payment Flow**
1. Browse to a listing
2. Fill booking form with date and location
3. Click "Reserve Now"
4. You'll be redirected to payment page
5. Click "Pay Securely" button
6. Use Razorpay test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4111 1111 1111 1112`
   - CVV: Any 3 digits
   - Expiry: Any future date

### 4. **Verify Database**
Check MongoDB collections:
- `bookings`: Should have `paymentStatus: 'paid'` and `status: 'confirmed'`
- `payments`: Should have `status: 'captured'` and `razorpayPaymentId`

---

## Razorpay Test Mode

Currently using **TEST MODE** credentials:
- Key ID: `rzp_test_RNTe8bfLkXBgPa`
- No real money is charged
- Use test cards for payments
- All transactions are sandbox

### To Switch to Production:
1. Get live credentials from Razorpay dashboard
2. Update `.env` with live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
3. Restart backend server

---

## API Response Examples

### Create Order Response:
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "order_MxxxxxxxxxxxxT",
    "amount": 500000,
    "currency": "INR",
    "keyId": "rzp_test_RNTe8bfLkXBgPa",
    "customerDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210"
    }
  }
}
```

### Verify Payment Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      "id": "payment_id",
      "razorpayPaymentId": "pay_xxxxx",
      "amount": 5000,
      "currency": "INR",
      "status": "captured",
      "paymentMethod": "upi"
    },
    "booking": {
      "id": "booking_id",
      "bookingNumber": "BK-2025-001",
      "paymentStatus": "paid",
      "status": "confirmed"
    }
  }
}
```

---

## Troubleshooting

### Issue: "Razorpay SDK failed to load"
- **Solution**: Check internet connection, ensure Razorpay script loads properly

### Issue: "Payment verification failed"
- **Solution**: Verify RAZORPAY_KEY_SECRET is correct in `.env`

### Issue: "Booking not found"
- **Solution**: Ensure booking is created before payment order

### Issue: Payment succeeds but booking not updated
- **Solution**: Check `/api/payments/verify` endpoint logs for errors

---

## Security Best Practices

1. ✅ **Never expose secret key** - Keep in `.env` and `.gitignore`
2. ✅ **Always verify signature** - Don't trust client-side data
3. ✅ **Use HTTPS in production** - Secure data transmission
4. ✅ **Log all transactions** - Maintain audit trail
5. ✅ **Validate amounts** - Prevent manipulation
6. ✅ **Handle failures gracefully** - Record and notify

---

## Additional Features to Implement

### Future Enhancements:
- [ ] Webhook integration for payment status updates
- [ ] Automated refund processing
- [ ] Payment reminders for pending bookings
- [ ] Invoice generation after successful payment
- [ ] Payment analytics dashboard
- [ ] Multi-currency support
- [ ] Subscription/recurring payments
- [ ] Split payments (vendor payout automation)

---

## Support & Documentation

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhook Guide**: https://razorpay.com/docs/webhooks/

---

## Summary

✅ **Backend**: Complete payment system with Razorpay integration  
✅ **Frontend**: Seamless payment flow with user-friendly UI  
✅ **Security**: Signature verification and secure transactions  
✅ **Testing**: Test mode enabled with sample credentials  
✅ **Database**: Payment tracking and transaction history  
✅ **Error Handling**: Comprehensive failure management  

**Status**: FULLY FUNCTIONAL AND READY FOR TESTING 🚀
