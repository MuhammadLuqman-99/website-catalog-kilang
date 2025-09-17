export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackCustomEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, parameters);
  }
};

// Track when user views a product
export const trackViewContent = (contentName, contentId, value, currency = 'MYR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: currency
    });
  }
};

// Track when user initiates contact with agent (like Add to Cart)
export const trackInitiateCheckout = (contentName, contentId, value, currency = 'MYR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: currency
    });
  }
};

// Track when user clicks order button
export const trackLead = (contentName, contentId, value, currency = 'MYR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: currency
    });
  }
};