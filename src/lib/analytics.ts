/**
 * Analytics event contracts + a safe dataLayer push helper.
 *
 * GA4 is configured through GTM only (Section 6) — we never load the gtag
 * snippet separately. This module defines the client-side event shapes and a
 * guarded `pushEvent` that is a NO-OP when GTM is not configured, and wraps
 * every push in try/catch so a tracking error can never break navigation.
 *
 * The actual DOM wiring (delegated click listener + IntersectionObserver) lives
 * in `components/analytics/AffiliateTracking.astro`, which imports from here.
 */

export interface AffiliateClickEvent {
  event: 'affiliate_click';
  affiliate_program: 'amazon';
  link_url: string;
  link_text: string;
  article_path: string;
  product_asin: string;
  /** hero | quick_picks | product_card | comparison_table | inline | footer */
  link_position: string;
}

export interface ViewProductCardEvent {
  event: 'view_product_card';
  product_asin: string;
  article_path: string;
  link_position: string;
}

export type DataLayerEvent = AffiliateClickEvent | ViewProductCardEvent;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** True only when a GTM dataLayer exists (GTM configured). */
export function isAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
}

/**
 * Push an event to the GTM dataLayer. No-op when GTM is absent; never throws.
 * This is the single choke point for all tracking.
 */
export function pushEvent(payload: DataLayerEvent): void {
  try {
    if (!isAnalyticsReady()) return; // GTM not configured -> no-op
    window.dataLayer!.push(payload);
  } catch {
    // Tracking must never break the page. Swallow deliberately.
  }
}
