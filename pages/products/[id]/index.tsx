"use client";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Star, Edit, ArrowLeft } from "lucide-react";
import type { GetServerSideProps } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Product } from "@/lib/types";
import Head from "next/head";

type ProductDetailProps = {
  product: Product | null;
  error?: string;
};

export default function ProductDetail({ product, error }: ProductDetailProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-muted-foreground">
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const fullStars = Math.floor(product.rating.rate);
  const emptyStars = 5 - fullStars;

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{product.title} | Aqtar</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
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

            <div className="flex flex-col p-8">
              <Badge className="w-fit mb-4 text-xs font-medium bg-primary/10 text-primary border-none">
                {product.category}
              </Badge>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {product.title}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(fullStars)].map((_, i) => (
                    <Star
                      key={`full-${i}`}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                  {[...Array(emptyStars)].map((_, i) => (
                    <Star
                      key={`empty-${i}`}
                      className="w-4 h-4 text-muted-foreground"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.rating.count} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold mb-6">
                ${product.price.toFixed(2)}
              </div>

              <p className="text-muted-foreground mb-8">
                {product.description}
              </p>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" className="w-full">
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  ProductDetailProps
> = async (context) => {
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

    const product: Product = await response.json();

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
