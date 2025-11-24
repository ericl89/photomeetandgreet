import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {verifyAccessMember} from "@/lib/auth/member";
import {cookies as nextCookies} from "next/headers";
import Navbar from "@/components/nav/Navbar";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Photography Meet & Greet Events",
    description: "Photography Meet & Greet Events",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        {media: "(prefers-color-scheme: dark)", color: "#000000"},
        {media: "(prefers-color-scheme: light)", color: "#ffffff"}
    ],
    colorScheme: "light"
}

export default async function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

    // todo: Replace with universal method
    const cookieStore = await nextCookies();
    const token = cookieStore.get("access")?.value;
    let restrict: "admin" | "member" | "guest" = "guest";

    if (token) {
        const {memberType} = await verifyAccessMember(token);
        if (memberType == "SUPER_ADMIN" || memberType == "GROUP_ADMIN") {
            restrict = "admin";
        } else if (memberType == "MEMBER") {
            restrict = "member";
        }

    }


    return (
        <html lang="en" className="h-full">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full relative`}
        >
        <main className="grid h-full w-full relative">
            <Navbar restrict={restrict}/>
            <div className="w-full h-full">{children}</div>
        </main>
        </body>
        </html>
    );
}
