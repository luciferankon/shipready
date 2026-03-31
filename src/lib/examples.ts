export const EXAMPLES: Record<string, string> = {
  auth: `diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts
index 3a4f1b2..9d8c42e 100644
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -12,6 +12,24 @@ import { verify } from 'jsonwebtoken'
 export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
   const token = req.headers.authorization?.split(' ')[1]
   if (!token) return res.status(401).json({ error: 'Unauthorized' })
+
+  try {
+    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
+
+    // check token expiry with 30s clock skew tolerance
+    const now = Math.floor(Date.now() / 1000)
+    if (decoded.exp && decoded.exp < now - 30) {
+      return res.status(401).json({ error: 'Token expired' })
+    }
+
+    // attach user context to request
+    req.user = { id: decoded.sub, roles: decoded.roles ?? [] }
+    next()
+  } catch (err) {
+    return res.status(401).json({ error: 'Invalid token' })
+  }
-  req.user = verify(token, process.env.JWT_SECRET!)
-  next()
 }`,

  perf: `diff --git a/src/services/product.service.ts b/src/services/product.service.ts
index 1a2b3c4..5d6e7f8 100644
--- a/src/services/product.service.ts
+++ b/src/services/product.service.ts
@@ -8,12 +8,22 @@ export class ProductService {
-  async getProductsWithReviews(ids: string[]) {
-    const products = await this.db.product.findMany({ where: { id: { in: ids } } })
-    for (const product of products) {
-      product.reviews = await this.db.review.findMany({ where: { productId: product.id } })
-    }
-    return products
+  async getProductsWithReviews(ids: string[]) {
+    // single query with join instead of N+1
+    return this.db.product.findMany({
+      where: { id: { in: ids } },
+      include: {
+        reviews: {
+          select: { rating: true, body: true, createdAt: true },
+          orderBy: { createdAt: 'desc' },
+          take: 5,
+        },
+      },
+    })
  }`,

  api: `Added rate limiting to the public API endpoints:
- Implemented sliding window rate limiter using Redis
- 100 req/min for authenticated users, 20 req/min for anonymous
- Returns 429 with Retry-After header when limit exceeded
- Added rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining) to all responses
- Excluded internal service-to-service calls from rate limiting`,

  bug: `diff --git a/src/hooks/useCart.ts b/src/hooks/useCart.ts
@@ -34,7 +34,7 @@ export function useCart() {
   const removeItem = useCallback((id: string) => {
-    setItems(items.filter(item => item.id !== id))
+    setItems(prev => prev.filter(item => item.id !== id))
   }, [])

   const updateQuantity = useCallback((id: string, qty: number) => {
-    setItems(items.map(item => item.id === id ? { ...item, qty } : item))
+    setItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item))
  }, [])`,
}
