/**
 * loadFeedData: A direct fetch wrapper that mimics the DSPClientTask
 * response/error callback pattern.
 */
export const loadFeedData = async (
  feedUrl: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    onResponse?: (data: any) => void;
    onError?: (error: any) => void;
  },
) => {
  const { method = 'GET', body = {}, onResponse, onError } = options;

  // 1. Basic Validation
  if (!feedUrl || typeof feedUrl !== 'string') {
    const message = 'Invalid feed URL';
    console.error(message);
    onError?.(message);
    return;
  }

  try {
    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    // 2. Handle Request Body
    // In JS/React Native, we don't send a body for GET requests
    if (method !== 'GET' && body && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    // 3. Execution
    const response = await fetch(feedUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Success Callback
    onResponse?.(data);
  } catch (error: any) {
    console.error('loadFeedData Error:', error.message);
    // 5. Error Callback
    onError?.(error.message || 'Unknown Network Error');
  }
};
