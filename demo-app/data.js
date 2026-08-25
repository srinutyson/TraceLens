export const documents = [
  {
    id: "doc-1",
    title: "PulseAPI Overview",
    text: "PulseAPI is a webhook delivery and event-tracking API for developers. It lets you send, retry, and monitor webhook events across any number of destination endpoints, with built-in delivery guarantees and detailed logs."
  },
  {
    id: "doc-2",
    title: "Free Plan",
    text: "The Free plan includes up to 1,000 webhook events per month, a single destination endpoint, and 24-hour event log retention. It does not include automatic retries on failed deliveries."
  },
  {
    id: "doc-3",
    title: "Pro Plan",
    text: "The Pro plan includes up to 100,000 webhook events per month, up to 10 destination endpoints, automatic retries with exponential backoff, and 30-day event log retention. Pro plan subscribers also get access to real-time delivery alerts."
  },
  {
    id: "doc-4",
    title: "Enterprise Plan",
    text: "The Enterprise plan offers unlimited webhook events, unlimited destination endpoints, custom retry policies, 1-year event log retention, and a dedicated support channel. Pricing is available on request."
  },
  {
    id: "doc-5",
    title: "Troubleshooting: Failed Deliveries",
    text: "If a webhook delivery fails, PulseAPI logs the response status code and error message in the event log. Free plan users must manually resend failed events; Pro and Enterprise plans retry automatically up to 5 times with increasing delay."
  },
  {
    id: "doc-6",
    title: "Troubleshooting: Authentication Errors",
    text: "A 401 error on any PulseAPI request usually means the API key is missing, expired, or was revoked. Keys can be regenerated from the dashboard, but regenerating a key immediately invalidates the previous one."
  },
  {
    id: "doc-7",
    title: "Rate Limits",
    text: "PulseAPI enforces a rate limit of 100 requests per minute on the Free plan and 1,000 requests per minute on the Pro plan. Enterprise customers can request a custom rate limit based on expected traffic."
  }
];

export function checkSystemStatus() {
  return {
    status: "operational",
    incident: null,
    checkedAt: new Date().toISOString()
  };
}

export function lookupPricingTier(planName) {
  const plans = {
    free: { name: "Free", pricePerMonth: 0, eventsIncluded: 1000 },
    pro: { name: "Pro", pricePerMonth: 49, eventsIncluded: 100000 },
    enterprise: { name: "Enterprise", pricePerMonth: null, eventsIncluded: "Unlimited" }
  };

  const normalized = planName?.toLowerCase();
  return plans[normalized] || { error: `Unknown plan: ${planName}` };
}

export function validateSession() {
  return {
    valid: true,
    sessionId: `sess_${Math.random().toString(16).slice(2, 10)}`
  };
}

export function checkRateLimit() {
  return {
    withinLimit: true,
    remaining: 87,
    limit: 100
  };
}

export function fetchAccountUsage() {
  return {
    eventsUsedThisMonth: 342,
    planLimit: 100000
  };
}