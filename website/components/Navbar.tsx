"use client";

import Link from "next/link";
import type React from "react";
import { type HTMLAttributes, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import { AnimatePresence, motion } from "framer-motion";

type NavbarProps = {
    className?: HTMLAttributes<HTMLDivElement>["className"];
};

const Navbar: React.FC<NavbarProps> = ({ className }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const toggleNavbar = () => setIsOpen(!isOpen);

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/resume-builder", label: "Resume-Builder (Beta)" },
        { href: "/account", label: "Account" },
    ];

    const menuItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1, duration: 0.3 },
        }),
    };

    return (
        <nav className="max-w-7xl top-3 border dark:border-border/60 rounded-lg mx-1 xl:mx-auto xl:w-full backdrop-blur supports-[backdrop-filter]:bg-background/40 z-40 left-0 right-0 sticky">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center xl:justify-start 2xl:justify-start lg:justify-start md:justify-start justify-between h-16 space-x-4">
                    <div className="flex items-center">
                            <Link href="/">
                                <Image
                                    src="/trackjobs_logo.svg"
                                    height={32}
                                    width={32}
                                    alt="TrackJobs Logo"
                                />
                            </Link>        
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map((item, i) => (
                                    <motion.div
                                        key={item.href}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={menuItemVariants}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`relative font-medium text-md px-3 py-2 transition-colors duration-200
                        ${
                                                pathname === item.href
                                                    ? "text-primary"
                                                    : "hover:text-primary/80"
                                            }`}
                                        >
                                            {item.label}
                                            {pathname === item.href && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                    initial={false}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 30,
                                                    }}
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="-mr-2 flex md:hidden">
                            <Button
                                onClick={toggleNavbar}
                                type="button"
                                className="inline-flex hover:bg-transparent hover:text-foreground items-center justify-center p-2 transition-all ease-in-out"
                                variant="outline"
                            >
                                <span className="sr-only">Open main menu</span>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {!isOpen ? <Menu /> : <X />}
                                </motion.div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Separator />
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.href}
                                    variants={menuItemVariants}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Link
                                        href={item.href}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium block transition-colors duration-200
                                            ${
                                            pathname === item.href
                                                ? "text-primary bg-primary/10"
                                                : "hover:bg-primary/5"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
