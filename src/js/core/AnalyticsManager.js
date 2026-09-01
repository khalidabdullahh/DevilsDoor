/**
 * AnalyticsManager — Privacy-Conscious Gameplay Telemetry.
 * Tracks level failure/success statistics without storing PII.
 */
export class AnalyticsManager {
  static enabled = true;

  static track(eventName, payload = {}) {
    if (!this.enabled) return;

    const event = {
      event: eventName,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      },
      ...payload
    };

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local dev log
      console.log(`[Analytics] ${eventName}`, payload);
    }
  }
}
