"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Eye, Search, Plus, Loader2, AlertCircle, AlertTriangle, MoreVertical } from "lucide-react"
import type { GetServerSideProps } from "next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Product } from "@/lib/types"
import Head from "next/head"

type ProductListProps = {
  products: Product[]
  categories: string[]
  error?: string
}

export default function ProductList({ products: initialProducts, categories, error }: ProductListProps) {
  const router = useRouter()
  const { search = "", category = "all", sort = "default" } = router.query
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState(search as string)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    if (!products) return

    let result = [...products]

    // Apply category filter
    if (category !== "all") {
      result = result.filter((product) => product.category === category)
    }

    // Apply search filter
    if (search) {
      const query = (search as string).toLowerCase()
      result = result.filter(
        (product) => product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "rating":
        result.sort((a, b) => b.rating.rate - a.rating.rate)
        break
      default:
        // Default sorting (by id)
        result.sort((a, b) => a.id - b.id)
    }

    setFilteredProducts(result)
  }, [products, category, search, sort])

  // Update URL with new filters
  const updateFilters = (newFilters: { search?: string; category?: string; sort?: string }) => {
    const query = {
      ...router.query,
      ...newFilters,
    }

    // Remove empty values
    Object.keys(query).forEach(
      (key) => (query[key] === "" || (query[key] === "all" && key === "category")) && delete query[key],
    )

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true },
    )
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchQuery })
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    updateFilters({ sort: value })
  }

  // Truncate text to a specific length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + "..."
  }

  // Add this function after other handler functions
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
    setDeleteError("")
  }

  // Add this function to handle the actual deletion
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    setDeleteError("")

    try {
      // Send DELETE request to delete the product
      const response = await fetch(`https://fakestoreapi.com/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      console.log("Product deleted:", result)

      // Close dialog
      setDeleteDialogOpen(false)
      setProductToDelete(null)

      // Refresh the product list
      const updatedProducts = products.filter((p) => p.id !== productToDelete.id)
      setProducts(updatedProducts)

      // Also update filtered products
      setFilteredProducts(filteredProducts.filter((p) => p.id !== productToDelete.id))
    } catch (error) {
      console.error("Error deleting product:", error)
      setDeleteError(error instanceof Error ? error.message : "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load products: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Products - Admin</title>
        <meta name="description" content="Admin panel for managing products" />
      </Head>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/products/create">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={handleSearchChange} className="pl-10" />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        <Select value={category as string} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort as string} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="title-asc">Name: A to Z</SelectItem>
            <SelectItem value="title-desc">Name: Z to A</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              <div className="relative pt-[100%] bg-muted/20">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              <CardContent className="flex-grow p-4">
                <Badge className="mb-2" variant="outline">
                  {product.category}
                </Badge>
                <h2 className="font-semibold mb-2 line-clamp-2" title={product.title}>
                  {product.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-3" title={product.description}>
                  {truncateText(product.description, 100)}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    ★ {product.rating.rate} ({product.rating.count})
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${product.id}`}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/products/${product.id}/edit`} className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-destructive"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("")
              updateFilters({ search: "", category: "all", sort: "default" })
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{productToDelete?.title}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async (context) => {
  try {
    // Get query parameters
    const { search, category, sort } = context.query

    // Fetch products from API
    const response = await fetch("https://fakestoreapi.com/products")

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const products: Product[] = await response.json()

    // Extract unique categories
    const categories = [...new Set(products.map((product) => product.category))]

    return {
      props: {
        products,
        categories,
        // Pass query params back to the component
        initialSearch: search || "",
        initialCategory: category || "all",
        initialSort: sort || "default",
      },
    }
  } catch (error) {
    console.error("Error fetching products:", error)

    return {
      props: {
        products: [],
        categories: [],
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
    }
  }
}

