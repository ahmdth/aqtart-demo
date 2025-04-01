"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, InfoIcon, Loader2 } from "lucide-react";

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
import Head from "next/head";

export default function CreateProduct() {
  const router = useRouter();

  const initialProduct = {
    title: "",
    price: "",
    description: "",
    category: "men's clothing",
    image: "",
    rating: {
      rate: 0,
      count: 0,
    },
  };

  const [formData, setFormData] = useState(initialProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imagePreview, setImagePreview] = useState(
    "/placeholder.svg?height=400&width=400"
  );

  const handleChange = (name, value) => {
    if (name === "rate" || name === "count") {
      setFormData({
        ...formData,
        rating: {
          ...formData.rating,
          [name]:
            value === ""
              ? 0
              : name === "rate"
              ? Number.parseFloat(value)
              : Number.parseInt(value),
        },
      });
    } else if (name === "image") {
      setFormData({
        ...formData,
        [name]: value,
      });
      setImagePreview(value || "/placeholder.svg?height=400&width=400");
    } else {
      setFormData({
        ...formData,
        [name]:
          name === "price"
            ? value === ""
              ? ""
              : Number.parseFloat(value)
            : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const newProduct = await response.json();
      console.log("Product created:", newProduct);

      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create product"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Create Product | Aqtar</title>
        <meta name="description" content="Create a new product" />
      </Head>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      <Card className="max-w-5xl mx-auto shadow-none border-0">
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
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
              <div className="space-y-6">
                <div className="relative w-full aspect-square bg-muted/30 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Alert className="mt-2 bg-primary/10 text-primary border-primary/20">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Product ID will be automatically generated when the product
                    is created.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter product title"
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
                    placeholder="0.00"
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
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid image URL to see a preview
                  </p>
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
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate">Initial Rating (0-5)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rating.rate}
                      onChange={(e) => handleChange("rate", e.target.value)}
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="count">Initial Review Count</Label>
                    <Input
                      id="count"
                      type="number"
                      value={formData.rating.count}
                      onChange={(e) => handleChange("count", e.target.value)}
                      placeholder="0"
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
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
