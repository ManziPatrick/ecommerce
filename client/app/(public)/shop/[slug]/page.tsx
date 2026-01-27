import { Metadata } from 'next';
import ShopClient from './ShopClient';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getShopData(slug: string) {
    const endpoint = process.env.NEXT_PUBLIC_API_URL_DEV 
        ? `${process.env.NEXT_PUBLIC_API_URL_DEV}/api/v1/graphql`
        : 'http://localhost:5000/api/v1/graphql';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    query GetShopMetadata($slug: String!) {
                        shop(slug: $slug) {
                            name
                            description
                            logo
                        }
                    }
                `,
                variables: { slug: slug.toLowerCase() }
            }),
            next: { revalidate: 60 } // Revalidate metadata every minute
        });
        
        const json = await res.json();
        return json.data?.shop;
    } catch (error) {
        console.error('Error fetching shop metadata:', error);
        return null;
    }
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Clean the slug just in case
  const decodedSlug = decodeURIComponent(slug);
  
  const shop = await getShopData(decodedSlug);
 
  if (!shop) {
    return {
      title: 'Shop Not Found | macyemacye',
      description: 'The requested shop could not be found.',
    };
  }
 
  return {
    title: `${shop.name} | macyemacye Shop`,
    description: shop.description || `Browse products from ${shop.name} on macyemacye.`,
    openGraph: {
      title: `${shop.name} | macyemacye Shop`,
      description: shop.description || `Browse products from ${shop.name} on macyemacye.`,
      images: shop.logo ? [shop.logo] : [],
    },
  };
}

export default async function ShopPage({ params }: Props) {
    const resolvedParams = await params;
    return <ShopClient slug={resolvedParams.slug} />;
}
