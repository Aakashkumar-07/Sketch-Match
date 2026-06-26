import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Sketch Match",
  description: "A modern collaborative drawing and sketching application with real-time multi-user support. Create beautiful hand-drawn style diagrams, wireframes, and sketches together.",
  keywords: ["drawing", "sketch", "collaboration", "whiteboard", "diagram", "wireframe"],
  openGraph: {
    title: "Sketch Match",
    description: "A modern collaborative drawing and sketching application with real-time multi-user support.",
    type: "website",
    siteName: "Sketch Match",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sketch Match",
    description: "A modern collaborative drawing and sketching application with real-time multi-user support.",
  },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
