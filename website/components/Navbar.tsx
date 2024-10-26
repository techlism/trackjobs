'use client'
import Link from 'next/link';
import type React from 'react';
import { type HTMLAttributes, useEffect, useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/utils';

type NavbarProps = {
    className?: HTMLAttributes<HTMLDivElement>['className'];
}

const Navbar: React.FC<NavbarProps> = ({ className } : NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    // useEffect(() => {
    //     setIsOpen(false);
    // });

    return (
        <nav className={cn("sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center xl:justify-start 2xl:justify-start lg:justify-start md:justify-start justify-between h-16 space-x-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href={'/'}>
                                <Image src="/trackjobs_logo.svg" height={32} width={32} alt="TrackJobs Logo" />
                            </Link>                            
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link className='font-medium hover:underline text-md' href={'/dashboard'}>Dashboard</Link>
                                <Link className='font-medium hover:underline text-md' href={'/about'}>About</Link>
                                <Link className='font-medium hover:underline text-md' href={'/profile'}>Profile</Link>
                            </div>
                        </div>
                    </div>                    
                    <div className="flex items-center">
                        <div className="-mr-2 flex md:hidden">
                            <Button onClick={toggleNavbar} type="button" className="inline-flex items-center justify-center p-2 transition" variant={'outline'}>
                                <span className="sr-only">Open main menu</span>
                                {!isOpen ? (
                                    <Menu/>
                                ) : (
                                    <X/>
                                )}
                            </Button>
                        </div>                                                                    
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden transition-slow">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-medium block hover:underline">Dashboard</Link>
                        <Link href="/about" className="px-3 py-2 rounded-lg text-sm font-medium block hover:underline">About</Link>
                        <Link href="/profile" className="px-3 py-2 rounded-lg text-sm font-medium block hover:underline">Profile</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;