import { Metadata } from 'next';
import ProductClient from './ProductClient';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProductData(slug: string) {
    const endpoint = process.env.NEXT_PUBLIC_API_URL_DEV 
        ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/api/v1/graphql`
        : 'http://localhost:5000/api/v1/graphql';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    query GetProductMetadata($slug: String!) {
                        product(slug: $slug) {
                            name
                            description
                            variants {
                              images
                            }
                        }
                    }
                `,
                variables: { slug }
            }),
            next: { revalidate: 60 }
        });
        
        const json = await res.json();
        return json.data?.product;
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        return null;
    }
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(slug);
  
  const product = await getProductData(decodedSlug);
 
  if (!product) {
    return {
      title: 'Product Not Found | macyemacye',
    };
  }

  const imageUrl = product.variants?.[0]?.images?.[0] || '/og-image.jpg';
 
  return {
    title: `${product.name} | macyemacye`,
    description: product.description || `Buy ${product.name} on macyemacye.`,
    openGraph: {
      title: `${product.name} | macyemacye`,
      description: product.description || `Buy ${product.name} on macyemacye.`,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
    const resolvedParams = await params;
    return <ProductClient slug={resolvedParams.slug} />;
}
