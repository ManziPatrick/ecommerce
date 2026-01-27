import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GRAPHQL_URL } from "./constants/config";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) console.error("GraphQL Error", graphQLErrors);
  if (networkError) console.error("Network Error", networkError);
});
console.log("GRAPHQL_URL: ", GRAPHQL_URL);
export const initializeApollo = (initialState = null) => {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: "include",
  });

  // Create or reuse Apollo Client instance
  const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            shop: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            shopById: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
        Product: {
          fields: {
            variants: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
        Shop: {
          fields: {
            products: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }).restore(initialState || {}),
  });

  return client;
};

// export default initializeApollo(); // Default export removed to prevent side effects
