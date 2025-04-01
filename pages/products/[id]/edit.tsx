"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { GetServerSideProps } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/lib/types";
import Head from "next/head";

type EditProductProps = {
  product: Product | null;
  error?: string;
};

export default function EditProduct({ product, error }: EditProductProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(
    product || {
      id: 0,
      title: "",
      price: 0,
      description: "",
      category: "",
      image: "",
      rating: { rate: 0, count: 0 },
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (name: string, value: any) => {
    if (name === "rate" || name === "count") {
      setFormData({
        ...formData,
        rating: {
          ...formData.rating,
          [name]:
            name === "rate" ? Number.parseFloat(value) : Number.parseInt(value),
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "price" ? Number.parseFloat(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `https://fakestoreapi.com/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const updatedProduct = await response.json();
      console.log("Product updated:", updatedProduct);

      router.push(`/products/${product.id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update product"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Edit Product | Aqtar</title>
        <meta
          name="description"
          content="Edit a product in the fake store API" />
      </Head>
      <div >
        <Button variant="outline" asChild>
          <Link href={`/products/${product.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
          </Link>
        </Button>
      </div>

      <Card className="max-w-6xl mx-auto shadow-none border-0">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center p-8 bg-white">
                <div className="relative w-full aspect-square max-w-md">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Right column - Product details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Product ID</Label>
                  <Input id="id" value={formData.id} readOnly disabled />
                  <p className="text-xs text-muted-foreground">
                    Product ID cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleChange("image", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men's clothing">
                        Men&apos;s Clothing
                      </SelectItem>
                      <SelectItem value="women's clothing">
                        Women&apos;s Clothing
                      </SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="jewelery">Jewelery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rating (0-5)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rating.rate}
                      onChange={(e) => handleChange("rate", e.target.value)}
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="count">Review Count</Label>
                    <Input
                      id="count"
                      type="number"
                      value={formData.rating.count}
                      onChange={(e) => handleChange("count", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<EditProductProps> = async (
  context
) => {
  try {
    const { id } = context.params || {};

    if (!id) {
      return {
        props: {
          product: null,
          error: "Product ID is required",
        },
      };
    }

    const response = await fetch(`https://fakestoreapi.com/products/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          props: {
            product: null,
            error: "Product not found",
          },
        };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const product = await response.json();

    return {
      props: {
        product,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);

    return {
      props: {
        product: null,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
};
