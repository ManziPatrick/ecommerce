# Apollo Client Error Debugging

## Current Error
Apollo Error Code 9 - Invariant Violation

## Changes Made

### 1. Updated Apollo Client Cache Configuration
- Added proper type policies for Shop, Query fields
- Changed merge strategy from `merge: true` to explicit merge functions
- This prevents cache conflicts

### 2. Updated Query Configuration
- Changed `fetchPolicy` from `'cache-and-network'` to `'network-only'`
- Added `notifyOnNetworkStatusChange: true`
- Added `onError` callbacks for better error logging

### 3. Enhanced Error Logging
- Added comprehensive error logging in useEffect
- Logs full error object, graphQLErrors, networkError

## Next Steps to Debug

1. **Check Browser Console** - Look for these new error logs:
   - `🔍 [ShopClient] GET_SHOP_BY_SLUG Error:`
   - `🔍 [ShopClient] Full Error Object:`
   - `🔍 [ShopClient] Error Details:`

2. **Check Network Tab**:
   - Verify the GraphQL request is being sent
   - Check if response status is 200
   - Verify response body contains the shop data

3. **Possible Issues**:
   - Apollo Client version mismatch
   - Cache corruption
   - Query/Response type mismatch
   - Network connectivity to GraphQL endpoint

## Temporary Workaround

If Apollo continues to fail, we can switch to using `fetch` directly or the RTK Query endpoint instead.
