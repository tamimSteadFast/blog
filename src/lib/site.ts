/**
 * Site-wide constants. Single source of truth for brand name, taglines,
 * navigation, social links, and legal/disclosure copy.
 *
 * This is an addition to the brief's file structure (the brief lists it under
 * `lib/` by intent). Keeping these out of components means re-branding or
 * re-niching touches one file, not fifty.
 */
import { CLUSTERS } from './clusters';

export const SITE = {
  name: 'Caliper Air',
  shortName: 'Caliper Air',
  /** The one-line positioning statement (Caliper design system). */
  tagline: 'Measure first. Then recommend.',
  description:
    'Independent, measurement-first reviews of home air purifiers — tested for noise and running cost, so you can pick the right one for your room.',
  /** Primary author handle shown in the footer and default OG metadata. */
  publisher: 'Caliper Air',
  locale: 'en-US',
  lang: 'en',
  /** Amazon marketplace (Section 0). Used for disclosure wording + currency. */
  marketplace: 'amazon.com' as const,
} as const;

/** Primary navigation — clusters plus the key editorial pages. */
export const NAV = [
  ...CLUSTERS.map((c) => ({ label: c.label, href: `/category/${c.slug}/` })),
  { label: 'About', href: '/about/' },
];

/** Footer link groups. */
export const FOOTER_NAV = {
  Reviews: CLUSTERS.map((c) => ({ label: c.label, href: `/category/${c.slug}/` })),
  Site: [
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Editorial policy', href: '/editorial-policy/' },
    { label: 'All articles', href: '/blog/' },
  ],
  Legal: [
    { label: 'Affiliate disclosure', href: '/affiliate-disclosure/' },
    { label: 'Privacy policy', href: '/privacy-policy/' },
    { label: 'Terms', href: '/terms/' },
  ],
};

/**
 * The short affiliate disclosure sentence. Exact wording and placement must
 * comply with the current Amazon Associates (US) policy — this is a starting
 * point, not legal advice. See docs/PROJECT_ARCHITECTURE.md Section D.
 */
export const DISCLOSURE_SHORT = 'As an Amazon Associate we earn from qualifying purchases.';

export const DISCLOSURE_LONG =
  'We earn a commission when you buy through links on this page, at no extra cost to you. ' +
  'As an Amazon Associate we earn from qualifying purchases. ' +
  'It never changes which product we recommend.';
