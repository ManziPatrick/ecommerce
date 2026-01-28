"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ApolloProvider } from "@apollo/client";
import { initializeApollo } from "./lib/apolloClient";
import Toast from "./components/feedback/Toast";
import AuthProvider from "./components/HOC/AuthProvider";
import TopLoadingBar from "./components/feedback/TopLoadingBar";
import ChatBot from "./components/chat/ChatBot";
import NotificationToast from "./components/chat/NotificationToast";
import GoogleOneTap from "./components/auth/GoogleOneTap";
import { useMemo } from "react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => initializeApollo(), []);

  return (
    <ApolloProvider client={client}>
      <TopLoadingBar />
      <Provider store={store}>
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV !== "test" && <Toast />}
        <ChatBot />
        <NotificationToast />
        <GoogleOneTap />
      </Provider>
    </ApolloProvider>
  );
}
