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
        averageRating
        reviewCount
        variants {
          id
          price
          discountPrice
          images
          stock
        }
      }
    }
  }
`;
