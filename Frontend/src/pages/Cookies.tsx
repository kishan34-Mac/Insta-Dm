import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function Cookies() {
  useSEO({
    title: "Cookies Policy - DMPilot",
    description: "Read the DMPilot Cookies Policy to understand how we use cookies and tracking mechanisms on our platform to optimize user experiences.",
    keywords: "cookies policy, tracking pixels, privacy settings, browser data"
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
        >
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-6">Cookies Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold">1. What Are Cookies</h2>
              <p>Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie. We use cookies and similar technologies to store and honor your preferences and settings, enable login authorization, and analyze platform performance.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold">2. How We Use Cookies</h2>
              <p>DMPilot uses cookies for several distinct operational purposes, including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Authentication:</strong> Keeping you logged in as you navigate through dashboard views.</li>
                <li><strong>Security:</strong> Detecting malicious activity and protecting server access layers.</li>
                <li><strong>Analytics:</strong> Gathering volume and traffic indicators to measure performance trends.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold">3. Types of Cookies We Use</h2>
              <p>We leverage both first-party cookies (set by our own domain) and third-party cookies (set by integration partners such as Meta Graph APIs for direct messaging compliance tags):</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Essential Cookies:</strong> Critical for enabling core platform services and security validation.</li>
                <li><strong>Functional Cookies:</strong> Storing customization preferences such as selected themes (Light/Dark).</li>
                <li><strong>Analytical Cookies:</strong> Processing page visits and response speeds to identify latency.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold">4. Managing Your Cookie Preferences</h2>
              <p>Most web browsers automatically accept cookies but provide settings options that allow you to block or delete them. If you choose to decline cookies, please note that you may not be able to sign in or use some interactive features of our Instagram automation tool.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
