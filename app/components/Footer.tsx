import { Instagram, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="border-t border-border bg-background">
            <div className='max-w-7xl mx-auto px-4'>
                <div className="container py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Navigate */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-second mb-6">
                                Navigate
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Shop All
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        About HyperReal
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/stores" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Stores
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        {/* Support */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-second mb-6">
                                Support
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Shipping & Returns
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/size-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Size Guide
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        {/* Newsletter */}
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-second mb-6">
                                Join the Syndicate
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Subscribe for early access to drops, exclusive events, and secret sales. No spam, just heat.
                            </p>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Type here" className="input w-10/12 bg-transparent rounded-none outline-none focus:border-second" />
                                <button className="btn bg-second rounded-none text-zinc-900 hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Bottom */}
                    <div className="flex flex-col md:flex-row justify-between items-center mt-16 pt-8 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            © 2025 HyperReal Studios. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://hyperreal.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Globe className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Giant Logo */}
            <div className="border-t border-border py-8 overflow-hidden">
                <h2 className="text-[8vw] font-bold text-muted/30 text-center tracking-tighter leading-none">
                    HYPER<span className="text-second/90 italic">REAL</span>
                </h2>
            </div>
        </footer>
    );
};

export default Footer;
