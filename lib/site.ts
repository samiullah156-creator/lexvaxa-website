export interface SiteConfig {
  name: string;
  url: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  /** Public 30-minute discovery call booking page. */
  calendlyUrl: string;
  location: string;
  tagline: string;
  description: string;
  markets: string[];
  founder: {
    name: string;
    role: string;
    bio: string;
    credential: string;
    education: { qualification: string; institution: string };
    expertise: string[];
    vision: string;
    linkedin: string;
  };
  socials: {
    linkedin: string;
    founderLinkedin: string;
    x: string;
    youtube: string;
    facebook: string;
    instagram: string;
    quora: string;
  };
}

// This application is deployed at the domain root; all canonical URLs share one origin.
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://lexvaxa.com');
if (!['http:', 'https:'].includes(siteOrigin.protocol)) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute HTTP or HTTPS URL.');
}

export const IS_PREVIEW =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.VERCEL_ENV === 'development' ||
  process.env.SITE_NOINDEX === 'true';

export const SITE: SiteConfig = {
  name: 'Lexvaxa',
  url: siteOrigin.origin,
  email: 'info@lexvaxa.com',
  phone: '+92 326 0879156',
  whatsappUrl: 'https://wa.me/923260879156',
  calendlyUrl: 'https://calendly.com/samiullahzahid156/new-meeting',
  location: 'Lahore, Pakistan',
  tagline: 'Engineering With Intelligence',
  description: 'Lexvaxa is an AI engineering and custom software company building intelligent workflows, SaaS platforms and enterprise solutions for businesses worldwide.',
  markets: ['United States', 'Canada', 'United Kingdom', 'Europe', 'Australia'],
  founder: {
    name: 'Sami Chaudhary',
    role: 'Founder & CEO',
    bio: 'Sami Chaudhary is a Microsoft Certified AI/ML Engineer and technology entrepreneur. He leads engineering at Lexvaxa, specialising in artificial intelligence, machine learning, intelligent system design and business automation for startups, SMEs and enterprises.',
    // Published on the existing lexvaxa.com/about page.
    credential: 'Microsoft Certified AI/ML Engineer',
    education: { qualification: 'Law degree (in progress)', institution: 'The Islamia University of Bahawalpur' },
    expertise: [
      'AI & machine learning engineering',
      'AI-powered application development',
      'Business process automation',
      'n8n, Make.com, Zapier & GoHighLevel',
      'Custom software & web applications',
      'CRM, API & system integrations',
      'Legal-tech automation',
    ],
    vision: 'Combining AI engineering with formal legal education to design compliance-aware, legally aligned technology, with a long-term focus on legal-tech innovation.',
    linkedin: 'https://www.linkedin.com/in/sami-lexvaxa/',
  },
  socials: {
    linkedin: 'https://www.linkedin.com/in/lexvaxa-solutions-6294683ab/',
    founderLinkedin: 'https://www.linkedin.com/in/sami-lexvaxa/',
    x: 'https://x.com/lexvaxa',
    youtube: 'https://www.youtube.com/@Lexvaxa',
    facebook: 'https://www.facebook.com/lexvaxa/',
    instagram: 'https://www.instagram.com/lexvaxa/',
    quora: 'https://www.quora.com/profile/Lexvaxa',
  },
};

export const NAV = [
  { label: 'What We Do', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'Our Work', href: '/work' },
  { label: 'Who We Are', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export const LEGAL_NAV = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Security', href: '/security' },
  { label: 'Accessibility', href: '/accessibility' },
];
