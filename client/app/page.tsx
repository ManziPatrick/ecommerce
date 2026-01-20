"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_SUMMARY, GET_PRODUCTS } from "./gql/Product";
import { useMemo, useState, useEffect } from "react";
import groupProductsByFlag from "./utils/groupProductsByFlag";
import SkeletonLoader from "./components/feedback/SkeletonLoader";
import Pagination from "./components/navigation/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

const HeroSection = dynamic(() => import("./(public)/(home)/HeroSection"), {
  ssr: false,
});
const CategoryBar = dynamic(() => import("./(public)/(home)/CategoryBar"), {
  ssr: false,
});
const ProductSection = dynamic(
  () => import("./(public)/product/ProductSection"),
  { ssr: false }
);
const MainLayout = dynamic(() => import("./components/templates/MainLayout"), {
  ssr: false,
});

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination State for "All Products"
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageParam > 0 ? pageParam : 1);
  const pageSize = 12; // Or maybe 8 or 16 for home page? Let's stick to 12.
  const skip = (currentPage - 1) * pageSize;

  // Fetch Summary Data (Highlights)
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useQuery(GET_PRODUCTS_SUMMARY, {
    variables: { first: 100 },
    fetchPolicy: "no-cache",
  });

  const { featured, trending, newArrivals, bestSellers } = useMemo(() => {
    if (!summaryData?.products?.products)
      return { featured: [], trending: [], newArrivals: [], bestSellers: [] };
    return groupProductsByFlag(summaryData.products.products);
  }, [summaryData]);

  // Fetch Paginated "All Products"
  const { data: allProductsData, loading: allProductsLoading, error: allProductsError } = useQuery(GET_PRODUCTS, {
    variables: { first: pageSize, skip },
    fetchPolicy: "no-cache",
  });

  const allProducts = allProductsData?.products?.products || [];
  const totalCount = allProductsData?.products?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    const newPage = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(newPage > 0 ? newPage : 1);
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", page.toString());
    router.push(`/?${query.toString()}`, { scroll: false });

    // Scroll to "All Products" section
    const element = document.getElementById("all-products-section");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (summaryLoading && !summaryData) {
    return (
      <MainLayout>
        <HeroSection />
        <SkeletonLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <HeroSection />
      <CategoryBar />
      <ProductSection
        title="Featured"
        products={featured}
        loading={false}
        error={summaryError}
        showTitle={true}
      />
      <ProductSection
        title="Trending"
        products={trending}
        loading={false}
        error={summaryError}
        showTitle={true}
      />
      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        loading={false}
        error={summaryError}
        showTitle={true}
      />
      <ProductSection
        title="Best Sellers"
        products={bestSellers}
        loading={false}
        error={summaryError}
        showTitle={true}
      />

      {/* All Products Section with Pagination */}
      <div id="all-products-section" className="scroll-mt-20">
        <ProductSection
          title="All Products"
          products={allProducts}
          loading={allProductsLoading}
          error={allProductsError}
          showTitle={true}
        />
        {!allProductsLoading && totalCount > pageSize && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
