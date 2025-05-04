import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">E-commerce API Documentation</h1>
          <p className="text-muted-foreground">
            Complete documentation for all available API endpoints in the e-commerce platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>

          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to set up and run the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">1. Environment Variables</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in the root directory
                  with the following variables:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                  <code>{`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
NEXTAUTH_SECRET=your_nextauth_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
HUGGINGFACE_API_KEY=your_huggingface_api_key`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-lg">2. MongoDB Setup</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                  <li>
                    Create a free MongoDB Atlas account at{" "}
                    <a
                      href="https://www.mongodb.com/cloud/atlas"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      mongodb.com/cloud/atlas
                    </a>
                  </li>
                  <li>Create a new cluster and database named "ecommerce"</li>
                  <li>Create a database user with read/write permissions</li>
                  <li>Get your connection string and replace username, password in the MONGODB_URI</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg">3. Upstash Redis Setup</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                  <li>
                    Create a free Upstash account at{" "}
                    <a
                      href="https://upstash.com/"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      upstash.com
                    </a>
                  </li>
                  <li>Create a new Redis database</li>
                  <li>Get your REST URL and REST token from the Upstash dashboard</li>
                  <li>Add them to your environment variables</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg">4. Hugging Face Setup</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                  <li>
                    Create a free Hugging Face account at{" "}
                    <a
                      href="https://huggingface.co/join"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      huggingface.co/join
                    </a>
                  </li>
                  <li>
                    Generate an API key at{" "}
                    <a
                      href="https://huggingface.co/settings/tokens"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      huggingface.co/settings/tokens
                    </a>
                  </li>
                  <li>Add the API key to your environment variables</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg">5. Seed the Database</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Visit <code className="bg-muted px-1 py-0.5 rounded">/api/seed</code> to populate the database with
                  initial data.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">6. Clear Cache (if needed)</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  If you're experiencing issues with cached data, visit{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">/api/cache/clear</code> to clear the Redis cache.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Products Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/products</span>
                  </CardTitle>
                </div>
                <CardDescription>Get all products with pagination, filtering, and sorting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">page</code> - Page number (default: 1)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Items per page (default: 10)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">category</code> - Filter by category
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">minPrice</code> - Minimum price
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">maxPrice</code> - Maximum price
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">search</code> - Search term
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">featured</code> - Show featured products
                      (true/false)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortField</code> - Field to sort by (default:
                      createdAt)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortOrder</code> - Sort order (asc/desc, default:
                      desc)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "products": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "description": "The latest iPhone with A15 Bionic chip...",
      "price": 999,
      "category": "electronics",
      "stock": 50,
      "images": [
        {
          "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
          "alt": "iPhone 13 Pro"
        }
      ],
      "rating": 4.5,
      "reviewCount": 120,
      "isFeatured": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    // More products...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/products/trending</span>
                  </CardTitle>
                </div>
                <CardDescription>Get trending products based on recent orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Number of products to return
                      (default: 10)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">category</code> - Filter by category (optional)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">timeframe</code> - Time period for trending
                      calculation (day, week, month, default: week)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "timeframe": "week",
  "products": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "description": "The latest iPhone with A15 Bionic chip...",
      "price": 999,
      "category": "electronics",
      "stock": 50,
      "images": [
        {
          "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
          "alt": "iPhone 13 Pro"
        }
      ],
      "rating": 4.5,
      "reviewCount": 120
    }
    // More products...
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/products/[slug]</span>
                  </CardTitle>
                </div>
                <CardDescription>Get a single product by slug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">slug</code> - Product slug
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "product": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "iPhone 13 Pro",
    "slug": "iphone-13-pro",
    "description": "The latest iPhone with A15 Bionic chip...",
    "price": 999,
    "category": "electronics",
    "stock": 50,
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
        "alt": "iPhone 13 Pro"
      }
    ],
    "rating": 4.5,
    "reviewCount": 120,
    "isFeatured": true,
    "specifications": {
      "display": "6.1-inch Super Retina XDR",
      "processor": "A15 Bionic",
      "storage": "128GB, 256GB, 512GB, 1TB",
      "camera": "Triple 12MP",
      "battery": "Up to 22 hours"
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Recommendations Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/recommendations/smart</span>
                  </CardTitle>
                </div>
                <CardDescription>Get smart personalized product recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">productId</code> - Product ID for item-based
                      recommendations (optional)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Number of recommendations to return
                      (default: 8)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional. If authenticated, returns personalized recommendations based on user's purchase history.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "recommendationType": "collaborative", // or "item-based" or "trending"
  "recommendations": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "price": 999,
      "category": "electronics",
      "images": [
        {
          "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
          "alt": "iPhone 13 Pro"
        }
      ],
      "rating": 4.5,
      "reviewCount": 120
    }
    // More products...
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/recommendations</span>
                  </CardTitle>
                </div>
                <CardDescription>Get basic product recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">type</code> - Type of recommendations (recommended,
                      recently-viewed, frequently-bought-together)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">productId</code> - Product ID for
                      frequently-bought-together recommendations
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">recentlyViewed</code> - Comma-separated list of
                      product IDs for recently-viewed recommendations
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Number of recommendations to return
                      (default: 8)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "recommendations": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro",
      "slug": "iphone-13-pro",
      "price": 999,
      "category": "electronics",
      "images": [
        {
          "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
          "alt": "iPhone 13 Pro"
        }
      ],
      "rating": 4.5,
      "reviewCount": 120
    }
    // More products...
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Search Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/search/suggestions</span>
                  </CardTitle>
                </div>
                <CardDescription>Get search suggestions as user types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">q</code> - Search query (min 2 characters)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Number of suggestions to return
                      (default: 5)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "query": "iphone",
  "suggestions": {
    "products": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "iPhone 13 Pro",
        "category": "electronics",
        "brand": "Apple"
      },
      {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "iPhone 12",
        "category": "electronics",
        "brand": "Apple"
      }
    ],
    "categories": ["electronics"],
    "brands": ["Apple"],
    "searchTerms": ["iPhone 13 Pro", "iPhone 12"]
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Product Bundles Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/products/bundles</span>
                  </CardTitle>
                </div>
                <CardDescription>Get product bundles with discounted prices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">productId</code> - Product ID to create a bundle
                      around (optional)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">category</code> - Category to create a bundle for
                      (optional)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Number of related products in the
                      bundle (default: 3)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "bundles": [
    {
      "_id": "bundle-60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro Bundle",
      "mainProduct": {
        "product": "60d21b4667d0d8992e610c85",
        "name": "iPhone 13 Pro",
        "price": 999,
        "category": "electronics",
        "images": [
          {
            "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
            "alt": "iPhone 13 Pro"
          }
        ]
      },
      "relatedProducts": [
        {
          "product": "60d21b4667d0d8992e610c86",
          "name": "AirPods Pro",
          "price": 249,
          "category": "electronics",
          "images": [
            {
              "url": "https://images.unsplash.com/photo-example.jpg",
              "alt": "AirPods Pro"
            }
          ]
        },
        {
          "product": "60d21b4667d0d8992e610c87",
          "name": "iPhone 13 Pro Case",
          "price": 49,
          "category": "accessories",
          "images": [
            {
              "url": "https://images.unsplash.com/photo-example.jpg",
              "alt": "iPhone 13 Pro Case"
            }
          ]
        }
      ],
      "individualTotal": 1297,
      "bundlePrice": 1167,
      "savings": 130,
      "savingsPercentage": 10
    }
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/products/bundles</span>
                  </CardTitle>
                </div>
                <CardDescription>Create a custom product bundle (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Headers</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "name": "Ultimate Gaming Bundle",
  "description": "Everything you need for gaming",
  "mainProductId": "60d21b4667d0d8992e610c85",
  "relatedProductIds": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
  "discountPercentage": 15
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "bundle": {
    "_id": "60d21b4667d0d8992e610c88",
    "name": "Ultimate Gaming Bundle",
    "description": "Everything you need for gaming",
    "mainProduct": {
      "product": "60d21b4667d0d8992e610c85",
      "name": "PlayStation 5",
      "price": 499.99,
      "category": "electronics",
      "images": [
        {
          "url": "https://images.unsplash.com/photo-example.jpg",
          "alt": "PlayStation 5"
        }
      ]
    },
    "relatedProducts": [
      {
        "product": "60d21b4667d0d8992e610c86",
        "name": "DualSense Controller",
        "price": 69.99,
        "category": "electronics",
        "images": [
          {
            "url": "https://images.unsplash.com/photo-example.jpg",
            "alt": "DualSense Controller"
          }
        ]
      },
      {
        "product": "60d21b4667d0d8992  "DualSense Controller"
          }
        ]
      },
      {
        "product": "60d21b4667d0d8992e610c87",
        "name": "Spider-Man 2",
        "price": 69.99,
        "category": "games",
        "images": [
          {
            "url": "https://images.unsplash.com/photo-example.jpg",
            "alt": "Spider-Man 2"
          }
        ]
      }
    ],
    "individualTotal": 639.97,
    "bundlePrice": 543.97,
    "savings": 96,
    "savingsPercentage": 15,
    "isActive": true,
    "createdAt": "2023-04-29T12:30:56.789Z",
    "updatedAt": "2023-04-29T12:30:56.789Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Sales Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/sales/flash</span>
                  </CardTitle>
                </div>
                <CardDescription>Get active flash sales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "flashSales": [
    {
      "_id": "60d21b4667d0d8992e610c89",
      "name": "Summer Flash Sale",
      "description": "Limited time offers on summer essentials",
      "discountPercentage": 25,
      "startTime": "2023-04-29T12:00:00.000Z",
      "endTime": "2023-04-29T18:00:00.000Z",
      "products": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "iPhone 13 Pro",
          "slug": "iphone-13-pro",
          "originalPrice": 999,
          "discountedPrice": 749.25,
          "savings": 249.75,
          "discountPercentage": 25,
          "category": "electronics",
          "images": [
            {
              "url": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
              "alt": "iPhone 13 Pro"
            }
          ],
          "stock": 50
        },
        // More products...
      ],
      "timeRemaining": 21600000 // Time remaining in milliseconds
    }
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/sales/flash</span>
                  </CardTitle>
                </div>
                <CardDescription>Create a new flash sale (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Headers</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "name": "Summer Flash Sale",
  "description": "Limited time offers on summer essentials",
  "productIds": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
  "discountPercentage": 25,
  "durationMinutes": 360
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "flashSale": {
    "_id": "60d21b4667d0d8992e610c89",
    "name": "Summer Flash Sale",
    "description": "Limited time offers on summer essentials",
    "productIds": ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"],
    "discountPercentage": 25,
    "startTime": "2023-04-29T12:00:00.000Z",
    "endTime": "2023-04-29T18:00:00.000Z",
    "isActive": true,
    "createdAt": "2023-04-29T12:00:00.000Z",
    "updatedAt": "2023-04-29T12:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Authentication Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/auth/register</span>
                  </CardTitle>
                </div>
                <CardDescription>Register a new user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/auth/login</span>
                  </CardTitle>
                </div>
                <CardDescription>Login with existing credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "email": "john@example.com",
  "password": "password123"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/auth/logout</span>
                  </CardTitle>
                </div>
                <CardDescription>Logout the current user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "message": "Logged out successfully"
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/auth/me</span>
                  </CardTitle>
                </div>
                <CardDescription>Get the current authenticated user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. Include the JWT token in the Authorization header or as a cookie.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Error Response (401 Unauthorized)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": false,
  "message": "Authentication required. Please log in."
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">AI Chatbot Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/chatbot</span>
                  </CardTitle>
                </div>
                <CardDescription>Smart shopping assistant that can understand various shopping intents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "query": "I need a birthday gift for a 5-year-old boy"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK) - Product List</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "response": {
    "intent": "gift",
    "message": "Here are some gift ideas for a 5-year-old boy:",
    "products": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "LEGO Duplo My First Animal Brick Box",
        "slug": "lego-duplo-animal-brick-box",
        "description": "Colorful LEGO Duplo set for toddlers with animal-themed bricks and easy building options.",
        "price": 29.99,
        "category": "toys",
        "images": [
          {
            "url": "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
            "alt": "LEGO Duplo Set"
          }
        ],
        "rating": 4.8,
        "reviewCount": 120
      },
      // More products...
    ],
    "type": "product_list"
  }
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Supported Intents</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">compare</code> - Compare products
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">gift</code> - Gift suggestions
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">budget</code> - Budget-based shopping
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">category</code> - Category browsing
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">age</code> - Age-based shopping
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">occasion</code> - Occasion-based shopping
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">specs</code> - Product specifications
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">search</code> - General product search
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Users Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/users</span>
                  </CardTitle>
                </div>
                <CardDescription>Get all users with pagination, filtering, and sorting (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">page</code> - Page number (default: 1)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Items per page (default: 10)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">search</code> - Search by name or email
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">role</code> - Filter by role (admin, user)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortField</code> - Field to sort by (default:
                      createdAt)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortOrder</code> - Sort order (asc/desc, default:
                      desc)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "users": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    // More users...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/users/[id]</span>
                  </CardTitle>
                </div>
                <CardDescription>Get a single user by ID (admin or self)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. Users can only access their own data, while admins can access any user's
                    data.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">id</code> - User ID
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-yellow-600">PUT</Badge>
                    <span>/api/users/[id]</span>
                  </CardTitle>
                </div>
                <CardDescription>Update a user (admin or self)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. Users can only update their own data, while admins can update any user's
                    data.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">id</code> - User ID
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "name": "John Smith",
  "email": "john.smith@example.com"
  // Role can only be updated by admins
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-red-600">DELETE</Badge>
                    <span>/api/users/[id]</span>
                  </CardTitle>
                </div>
                <CardDescription>Delete a user (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">id</code> - User ID
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "message": "User deleted successfully"
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Orders Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/orders</span>
                  </CardTitle>
                </div>
                <CardDescription>Get all orders (admin) or user orders (user)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. Users can only see their own orders, while admins can see all orders.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">page</code> - Page number (default: 1)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Items per page (default: 10)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">status</code> - Filter by status (pending,
                      processing, shipped, delivered, cancelled)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortField</code> - Field to sort by (default:
                      createdAt)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortOrder</code> - Sort order (asc/desc, default:
                      desc)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "orders": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "user": {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": "60d21b4667d0d8992e610c87",
          "name": "iPhone 13 Pro",
          "quantity": 1,
          "price": 999,
          "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
        }
      ],
      "shippingInfo": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "postalCode": "10001",
        "phone": "123-456-7890"
      },
      "paymentInfo": {
        "id": "pi_1J4JkZCZ6qsJgndJZw0Kw3Mn",
        "status": "succeeded",
        "method": "stripe"
      },
      "subtotal": 999,
      "tax": 89.91,
      "shipping": 10,
      "discount": 0,
      "total": 1098.91,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    // More orders...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/orders</span>
                  </CardTitle>
                </div>
                <CardDescription>Create a new order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. The user ID is automatically set from the authenticated user.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "items": [
    {
      "product": "60d21b4667d0d8992e610c87",
      "name": "iPhone 13 Pro",
      "quantity": 1,
      "price": 999,
      "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
    }
  ],
  "shippingInfo": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "phone": "123-456-7890"
  },
  "paymentInfo": {
    "id": "pi_1J4JkZCZ6qsJgndJZw0Kw3Mn",
    "status": "succeeded",
    "method": "stripe"
  },
  "subtotal": 999,
  "tax": 89.91,
  "shipping": 10,
  "discount": 0,
  "total": 1098.91,
  "couponApplied": "SUMMER10",
  "notes": "Please leave at the  10,
  "discount": 0,
  "total": 1098.91,
  "couponApplied": "SUMMER10",
  "notes": "Please leave at the front door"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "order": {
    "_id": "60d21b4667d0d8992e610c85",
    "user": "60d21b4667d0d8992e610c86",
    "items": [
      {
        "product": "60d21b4667d0d8992e610c87",
        "name": "iPhone 13 Pro",
        "quantity": 1,
        "price": 999,
        "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    "shippingInfo": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001",
      "phone": "123-456-7890"
    },
    "paymentInfo": {
      "id": "pi_1J4JkZCZ6qsJgndJZw0Kw3Mn",
      "status": "succeeded",
      "method": "stripe"
    },
    "subtotal": 999,
    "tax": 89.91,
    "shipping": 10,
    "discount": 0,
    "total": 1098.91,
    "couponApplied": "SUMMER10",
    "notes": "Please leave at the front door",
    "status": "pending",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/orders/[id]</span>
                  </CardTitle>
                </div>
                <CardDescription>Get a single order by ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires authentication. Users can only access their own orders, while admins can access any order.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">id</code> - Order ID
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "order": {
    "_id": "60d21b4667d0d8992e610c85",
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "product": "60d21b4667d0d8992e610c87",
        "name": "iPhone 13 Pro",
        "quantity": 1,
        "price": 999,
        "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    "shippingInfo": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001",
      "phone": "123-456-7890"
    },
    "paymentInfo": {
      "id": "pi_1J4JkZCZ6qsJgndJZw0Kw3Mn",
      "status": "succeeded",
      "method": "stripe"
    },
    "subtotal": 999,
    "tax": 89.91,
    "shipping": 10,
    "discount": 0,
    "total": 1098.91,
    "status": "pending",
    "trackingNumber": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-yellow-600">PUT</Badge>
                    <span>/api/orders/[id]</span>
                  </CardTitle>
                </div>
                <CardDescription>Update order status (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Path Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">id</code> - Order ID
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "order": {
    "_id": "60d21b4667d0d8992e610c85",
    "user": {
      "_id": "60d21b4667d0d8992e610c86",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [
      {
        "product": "60d21b4667d0d8992e610c87",
        "name": "iPhone 13 Pro",
        "quantity": 1,
        "price": 999,
        "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    "shippingInfo": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001",
      "phone": "123-456-7890"
    },
    "paymentInfo": {
      "id": "pi_1J4JkZCZ6qsJgndJZw0Kw3Mn",
      "status": "succeeded",
      "method": "stripe"
    },
    "subtotal": 999,
    "tax": 89.91,
    "shipping": 10,
    "discount": 0,
    "total": 1098.91,
    "status": "shipped",
    "trackingNumber": "1Z999AA10123456784",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Reviews Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/reviews</span>
                  </CardTitle>
                </div>
                <CardDescription>Get all reviews for a product with pagination, filtering, and sorting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">productId</code> - Product ID (required)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">page</code> - Page number (default: 1)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Items per page (default: 10)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">minRating</code> - Filter by minimum rating
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortField</code> - Field to sort by (default:
                      createdAt)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">sortOrder</code> - Sort order (asc/desc, default:
                      desc)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "reviews": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "product": "60d21b4667d0d8992e610c85",
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "rating": 4,
      "text": "Great product, very satisfied with the quality!",
      "isApproved": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    // More reviews...
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/reviews</span>
                  </CardTitle>
                </div>
                <CardDescription>Create a new product review (authenticated users only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Request Headers</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "product": "60d21b4667d0d8992e610c85", // Product ID
  "rating": 4, // Rating from 1-5
  "text": "Great product, very satisfied with the quality!"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "review": {
    "_id": "60d21b4667d0d8992e610c85",
    "product": "60d21b4667d0d8992e610c85",
    "user": "60d21b4667d0d8992e610c85",
    "rating": 4,
    "text": "Great product, very satisfied with the quality!",
    "isApproved": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Error Responses</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <strong>400 Bad Request</strong> - Missing required fields or user already reviewed this product
                    </li>
                    <li>
                      <strong>401 Unauthorized</strong> - User not authenticated
                    </li>
                    <li>
                      <strong>500 Server Error</strong> - Internal server error
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Notes</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>A user can only submit one review per product</li>
                    <li>
                      New reviews are set to <code className="bg-muted px-1 py-0.5 rounded">isApproved: false</code> by
                      default and require admin approval
                    </li>
                    <li>When a review is created, the product's average rating is automatically updated</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/dashboard/stats</span>
                  </CardTitle>
                </div>
                <CardDescription>Get dashboard statistics (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "stats": {
    "counts": {
      "users": 1250,
      "products": 450,
      "orders": 3200,
      "reviews": 1800,
      "outOfStockProducts": 12
    },
    "growth": {
      "newUsers": 120,
      "userGrowthRate": 15.5,
      "revenueGrowthRate": 22.3
    },
    "revenue": {
      "total": 325000,
      "last30Days": 42500,
      "average": 101.56
    },
    "recentOrders": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "total": 1098.91,
        "status": "pending",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
      // More orders...
    ],
    "topProducts": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "iPhone 13 Pro",
        "totalSold": 120,
        "revenue": 119880,
        "category": "electronics",
        "image": "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"
      }
      // More products...
    ],
    "orderStatusStats": [
      {
        "_id": "pending",
        "count": 45,
        "revenue": 42500
      },
      {
        "_id": "processing",
        "count": 32,
        "revenue": 35600
      },
      {
        "_id": "shipped",
        "count": 78,
        "revenue": 82300
      },
      {
        "_id": "delivered",
        "count": 156,
        "revenue": 164200
      },
      {
        "_id": "cancelled",
        "count": 12,
        "revenue": 10400
      }
    ],
    "revenueByCategory": [
      {
        "_id": "electronics",
        "revenue": 185000,
        "count": 320
      },
      {
        "_id": "clothing",
        "revenue": 75000,
        "count": 450
      },
      {
        "_id": "home",
        "revenue": 45000,
        "count": 210
      }
      // More categories...
    ],
    "monthlySales": [
      {
        "month": "Jan",
        "year": 2023,
        "sales": 42500,
        "count": 420
      },
      {
        "month": "Feb",
        "year": 2023,
        "sales": 38700,
        "count": 385
      }
      // More months...
    ],
    "dailySignups": [
      {
        "date": "2023-01-01",
        "count": 12
      },
      {
        "date": "2023-01-02",
        "count": 8
      }
      // More days...
    ],
    "lowStockProducts": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "iPhone 13 Pro",
        "stock": 5,
        "category": "electronics",
        "price": 999
      }
      // More products...
    ],
    "chatbotStats": {
      "totalQueries": 3200,
      "queriesLast30Days": 450,
      "intentDistribution": [
        {
          "_id": "search",
          "count": 1200
        },
        {
          "_id": "compare",
          "count": 850
        },
        {
          "_id": "gift",
          "count": 650
        }
        // More intents...
      ]
    },
    "newsletterStats": {
      "totalSubscribers": 5200,
      "newSubscribers": 320,
      "unsubscribes": 45
    }
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/dashboard/export</span>
                  </CardTitle>
                </div>
                <CardDescription>Export data as CSV (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">type</code> - Type of data to export (inventory,
                      orders, users)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Returns a CSV file with the requested data. The response will have the following headers:
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Content-Type: text/csv
Content-Disposition: attachment; filename="inventory_1682789456789.csv"`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Admin Endpoints</h2>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/admin/activity-logs</span>
                  </CardTitle>
                </div>
                <CardDescription>Get admin activity logs (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">page</code> - Page number (default: 1)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">limit</code> - Items per page (default: 50)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">action</code> - Filter by action (create, update,
                      delete, login, logout, other)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">resourceType</code> - Filter by resource type
                      (product, user, order, review, coupon, other)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">userId</code> - Filter by user ID
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">startDate</code> - Filter by start date
                      (YYYY-MM-DD)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">endDate</code> - Filter by end date (YYYY-MM-DD)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "logs": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "user": {
        "_id": "60d21b4667d0d8992e610c86",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
      },
      "action": "create",
      "resourceType": "product",
      "resourceId": "60d21b4667d0d8992e610c87",
      "details": "Created new product: iPhone 13 Pro",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
    // More logs...
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 50,
    "pages": 5
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">POST</Badge>
                    <span>/api/admin/activity-logs</span>
                  </CardTitle>
                </div>
                <CardDescription>Create activity log entry (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "action": "update",
  "resourceType": "product",
  "resourceId": "60d21b4667d0d8992e610c87",
  "details": "Updated product price from $999 to $899"
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (201 Created)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "log": {
    "_id": "60d21b4667d0d8992e610c88",
    "user": "60d21b4667d0d8992e610c86",
    "action": "update",
    "resourceType": "product",
    "resourceId": "60d21b4667d0d8992e610c87",
    "details": "Updated product price from $999 to $899",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">GET</Badge>
                    <span>/api/admin/settings</span>
                  </CardTitle>
                </div>
                <CardDescription>Get store settings (admin only for private settings)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Query Parameters</h3>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">public</code> - Get only public settings
                      (true/false)
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">group</code> - Filter by group (general,
                      appearance, payment, shipping, email, social, other)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for private settings. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "settings": {
    "storeName": "E-Commerce Store",
    "storeDescription": "Your one-stop shop for all your needs",
    "logoUrl": "https://example.com/logo.png",
    "faviconUrl": "https://example.com/favicon.ico",
    "primaryColor": "#3498db",
    "secondaryColor": "#2ecc71",
    "enableDarkMode": true,
    "currencyCode": "USD",
    "currencySymbol": "$",
    "taxRate": 0.1,
    "shippingFee": 10,
    "freeShippingThreshold": 100,
    "contactEmail": "contact@example.com",
    "contactPhone": "+1 123 456 7890",
    "socialLinks": {
      "facebook": "https://facebook.com/store",
      "twitter": "https://twitter.com/store",
      "instagram": "https://instagram.com/store",
      "youtube": "https://youtube.com/store"
    },
    "enableReviews": true,
    "enableWishlist": true,
    "enableChatbot": true
  },
  "metadata": [
    {
      "key": "storeName",
      "value": "E-Commerce Store",
      "group": "general",
      "isPublic": true,
      "description": "Name of the store"
    }
    // More settings metadata...
  ]
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-yellow-600">PUT</Badge>
                    <span>/api/admin/settings</span>
                  </CardTitle>
                </div>
                <CardDescription>Update store settings (admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires admin authentication. Include the JWT token in the Authorization header.
                  </p>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`Authorization: Bearer {token}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "storeName": "New Store Name",
  "primaryColor": "#ff5733",
  "taxRate": 0.08,
  "enableChatbot": false
}`}</code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold">Response (200 OK)</h3>
                  <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto text-sm">
                    <code>{`{
  "success": true,
  "message": "Settings updated successfully"
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
