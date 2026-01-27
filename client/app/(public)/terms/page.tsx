import React from "react";
import MainLayout from "@/app/components/templates/MainLayout";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 border-b pb-4">Terms of Service</h1>
            
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p className="lead">
                Welcome to macyemacye. These Terms of Service ("Terms") govern your use of our website, products, and services. By accessing or using our platform, you agree to be bound by these Terms.
              </p>

              <h3>1. General Conditions</h3>
              <p>
                We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices.
              </p>

              <h3>2. Products and Services</h3>
              <p>
                Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
              </p>
              <p>
                We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
              </p>

              <h3>3. User Comments and Feedback</h3>
              <p>
                If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.
              </p>

              <h3>4. Personal Information</h3>
              <p>
                Your submission of personal information through the store is governed by our Privacy Policy.
              </p>

              <h3>5. Contact Information</h3>
              <p>
                Questions about the Terms of Service should be sent to us at support@macyemacye.com.
              </p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500">
               Last updated: January 2026
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
