"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/lib/context'
const NavItems = ({navItems}) => {
    const pathname = usePathname()
    const { isSignedIn, user } = useAppContext();
    
  return (
    <nav className="hidden md:flex items-center space-x-6">
          
    {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex flex-row items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.icon}
          {item.name}
          {item.name === "Profile" && isSignedIn && user && (
            <span className="ml-2 text-xs text-green-500">●</span>
          )}
        </Link>
        ))}
    </nav>
  )
}

export default NavItems