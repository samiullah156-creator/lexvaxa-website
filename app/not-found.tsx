import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/ui';
export default function NotFound(){ return <section className="container not-found"><Eyebrow>Page not found</Eyebrow><h1>That page isn’t here.</h1><p>Browse our core services or return to the homepage.</p><Link href="/" className="button">Back to Lexvaxa <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></Link></section> }
