import "./globals.css";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata = {
  title: "CodeArena — Master Coding Interviews",
  description: "Practice 25+ coding problems, join live contests, and prepare for technical interviews at top tech companies.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
