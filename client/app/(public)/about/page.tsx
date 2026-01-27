"use client";

import React from "react";
import MainLayout from "@/app/components/templates/MainLayout";
import { motion } from "framer-motion";
import { Award, Users, Globe, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
                Empowering Local <span className="text-indigo-400">Commerce</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                macyemacye is Rwanda's premier digital marketplace, connecting visionary creators and vendors with customers who value quality, authenticity, and local innovation.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="py-16 bg-white -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard number="5k+" label="Active Users" delay={0} />
              <StatCard number="1k+" label="Products" delay={0.1} />
              <StatCard number="100+" label="Verified Vendors" delay={0.2} />
              <StatCard number="24/7" label="Support" delay={0.3} />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full md:w-1/2"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Our Team" 
                  className="rounded-2xl shadow-2xl"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full md:w-1/2"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We believe in the power of local entrepreneurship. Our mission is to provide a digital infrastructure that allows Rwandan businesses to thrive in the modern economy, reaching customers far beyond their physical locations.
                </p>
                <div className="space-y-4">
                  <FeatureRow text="Supporting local artisans and businesses" />
                  <FeatureRow text="Secure and transparent transactions" />
                  <FeatureRow text="Fast and reliable country-wide delivery" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose macyemacye?</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={<ShieldCheck className="w-10 h-10 text-emerald-500" />}
                  title="Secure Payments"
                  description="We use banking-grade encryption to ensure your transactions are always safe."
                />
                <FeatureCard 
                  icon={<Award className="w-10 h-10 text-indigo-500" />}
                  title="Premium Quality"
                  description="Every product on our platform is vetted for quality and authenticity."
                />
                <FeatureCard 
                  icon={<Globe className="w-10 h-10 text-blue-500" />}
                  title="Nationwide Reach"
                  description="We deliver to every corner of Rwanda, bringing the market to your doorstep."
                />
             </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function StatCard({ number, label, delay }: { number: string, label: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100"
    >
      <div className="text-4xl font-bold text-indigo-600 mb-2">{number}</div>
      <div className="text-gray-500 font-medium">{label}</div>
    </motion.div>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
       <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-6">
         {icon}
       </div>
       <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
       <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
