import { gql } from "@apollo/client";

export const GET_SHOP_BY_SLUG = gql`
  query GetShopBySlug($slug: String!) {
    shop(slug: $slug) {
      id
      name
      slug
      description
      logo
      email
      phone
      country
      city
      village
      street
      placeName
      latitude
      longitude
      products {
        id
        name
        slug
        description
        isNew
        isFeatured
        isTrending
        isBestSeller
        averageRating
        reviewCount
        category {
          id
          name
          slug
        }
        variants {
          id
          sku
          price
          discountPrice
          images
          stock
        }
      }
    }
  }
`;

export const GET_SHOP_BY_ID = gql`
  query GetShopById($id: String!) {
    shopById(id: $id) {
      id
      name
      slug
      description
      logo
      email
      phone
      country
      city
      village
      street
      placeName
      latitude
      longitude
      products {
        id
        name
        slug
        description
        isNew
        isFeatured
        isTrending
        isBestSeller
        averageRating
        reviewCount
        category {
          id
          name
          slug
        }
        variants {
          id
          sku
          price
          discountPrice
          images
          stock
        }
      }
    }
  }
`;

