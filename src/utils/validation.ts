// URL validation utility for security
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow safe protocols
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Input length limits
export const INPUT_LIMITS = {
  NODE_LABEL: 100,
  NODE_DESCRIPTION: 500,
  LINK_URL: 2048,
  LINK_NAME: 200,
  MAX_ATTACHMENTS: 20,
} as const;

export const validateLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};
