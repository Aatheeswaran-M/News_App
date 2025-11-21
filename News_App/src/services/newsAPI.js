import axios from "axios";

// Primary API Configuration - NewsData.io
const NEWSDATA_API_KEY = "pub_8678595cc0a84263adb9daaef622cbf4";
const BASE_URL = "https://newsdata.io/api/1/latest";

// Fallback API Keys (keep as backup)
const FALLBACK_API_KEYS = [
  "a06778c5-7c33-4361-9ff7-0f5226270b99"
];
const FALLBACK_BASE_URL = "https://api.newspi.org/v1/articles";

// Lightweight local sample fallback used when external APIs are down/rate-limited
const SAMPLE_ARTICLES = [
  {
    title: 'Sample: Local News — Stay informed',
    description: 'This is sample news shown when external providers are unavailable.',
    image_url: '',
    link: 'sample-1',
    source: 'LocalFallback',
    pubDate: new Date().toISOString()
  },
  {
    title: 'Sample: Technology Update',
    description: 'A short summary about the latest in technology.',
    image_url: '',
    link: 'sample-2',
    source: 'LocalFallback',
    pubDate: new Date().toISOString()
  }
];
// Stored structure for API usage tracking
const getStoredData = () => {
  const stored = localStorage.getItem('newsapp-api-data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        primaryApiCount: parsed.primaryApiCount || 0,
        fallbackKeyIndex: parsed.fallbackKeyIndex || 0,
        fallbackCounts: Array.isArray(parsed.fallbackCounts) && parsed.fallbackCounts.length === FALLBACK_API_KEYS.length ? parsed.fallbackCounts : new Array(FALLBACK_API_KEYS.length).fill(0),
        blockedUntil: parsed.blockedUntil || {},
        lastReset: parsed.lastReset || Date.now()
      };
    } catch {
      return { primaryApiCount: 0, fallbackKeyIndex: 0, fallbackCounts: new Array(FALLBACK_API_KEYS.length).fill(0), blockedUntil: {}, lastReset: Date.now() };
    }
  }
  return { primaryApiCount: 0, fallbackKeyIndex: 0, fallbackCounts: new Array(FALLBACK_API_KEYS.length).fill(0), blockedUntil: {}, lastReset: Date.now() };
};

const saveStoredData = (data) => {
  localStorage.setItem('newsapp-api-data', JSON.stringify(data));
};

let apiData = getStoredData();

// Simple FIFO queue to avoid parallel API calls (prevents rapid quota draining)
const requestQueue = [];
let processingQueue = false;
const enqueueRequest = (task) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ task, resolve, reject });
    processQueue();
  });
};

const processQueue = async () => {
  if (processingQueue) return;
  const item = requestQueue.shift();
  if (!item) return;
  processingQueue = true;
  try {
    const res = await item.task();
    item.resolve(res);
  } catch (err) {
    item.reject(err);
  } finally {
    processingQueue = false;
    // process next
    if (requestQueue.length > 0) setTimeout(processQueue, 0);
  }
};

// Reset counts if more than 24 hours have passed
const checkDailyReset = () => {
  const now = Date.now();
  const hoursSinceReset = (now - apiData.lastReset) / (1000 * 60 * 60);
  if (hoursSinceReset >= 24) {
    console.log('newsAPI: 24 hours passed, resetting API counts and blocked state');
    apiData = { 
      primaryApiCount: 0, 
      fallbackKeyIndex: 0, 
      fallbackCounts: new Array(FALLBACK_API_KEYS.length).fill(0), 
      blockedUntil: {}, 
      lastReset: now 
    };
    saveStoredData(apiData);
  }
};

const isKeyBlocked = (index) => {
  const until = apiData.blockedUntil && apiData.blockedUntil[index];
  return typeof until === 'number' && Date.now() < until;
};

const getActiveApiKey = () => {
  checkDailyReset();

  // First try primary NewsData.io API (1000 requests/day limit)
  if (apiData.primaryApiCount < 950 && !isKeyBlocked('primary')) {
    return { key: NEWSDATA_API_KEY, index: 'primary', isPrimary: true };
  }

  // Fall back to backup APIs
  for (let i = 0; i < FALLBACK_API_KEYS.length; i++) {
    const idx = (apiData.fallbackKeyIndex + i) % FALLBACK_API_KEYS.length;
    if (!isKeyBlocked(idx) && apiData.fallbackCounts[idx] < 195) {
      apiData.fallbackKeyIndex = idx;
      saveStoredData(apiData);
      return { key: FALLBACK_API_KEYS[idx], index: idx, isPrimary: false };
    }
  }

  // If all fallback keys are blocked, choose the one with smallest count
  let minIdx = 0;
  for (let j = 1; j < apiData.fallbackCounts.length; j++) {
    if (apiData.fallbackCounts[j] < apiData.fallbackCounts[minIdx]) minIdx = j;
  }
  apiData.fallbackKeyIndex = minIdx;
  saveStoredData(apiData);
  return { key: FALLBACK_API_KEYS[minIdx], index: minIdx, isPrimary: false };
};

const incrementRequestCount = (index, isPrimary = false) => {
  if (isPrimary || index === 'primary') {
    apiData.primaryApiCount = (apiData.primaryApiCount || 0) + 1;
    const remaining = 1000 - apiData.primaryApiCount;
    console.log(`newsAPI: Using Primary NewsData.io API | Requests: ${apiData.primaryApiCount}/1000 | Remaining: ${remaining}`);
  } else {
    apiData.fallbackCounts[index] = (apiData.fallbackCounts[index] || 0) + 1;
    const remaining = 200 - apiData.fallbackCounts[index];
    console.log(`newsAPI: Using Fallback Key ${index + 1} | Requests: ${apiData.fallbackCounts[index]}/200 | Remaining: ${remaining}`);
  }
  saveStoredData(apiData);
};

// --- Request dedupe + cache ---
const inFlightRequests = new Map(); // query -> Promise
const cache = new Map(); // query -> { ts, data }
const CACHE_TTL = 60 * 1000; // 1 minute cache for identical queries

export const getLatestNews = (query = "", category = "", retries = 2) => {
  // Enhanced query validation and sanitization
  let searchQuery;
  let searchCategory;
  let useSearch = false;
  let useCategory = false;
  
  if (typeof query === 'string' && query.trim() && query.trim().toLowerCase() !== "latest") {
    searchQuery = query.trim().slice(0, 100); // Limit length
    // Remove potentially problematic characters
    searchQuery = searchQuery.replace(/[<>"'&]/g, '').replace(/\s+/g, ' ');
    // Ensure minimum length for meaningful search
    if (searchQuery.length >= 2) {
      // Check if this looks like a category
      const categories = ['technology', 'sports', 'politics', 'business', 'entertainment', 'health', 'science', 'world'];
      if (categories.includes(searchQuery.toLowerCase())) {
        searchCategory = searchQuery.toLowerCase();
        useCategory = true;
      } else {
        useSearch = true;
      }
    }
  }
  
  // Explicit category parameter override
  if (category && typeof category === 'string') {
    searchCategory = category.toLowerCase();
    useCategory = true;
    useSearch = false;
  }
  
  const cacheKey = `${BASE_URL}|${searchQuery || searchCategory || 'latest'}`;

  // return from short cache if available
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }

  // return in-flight promise if identical request is running
  if (inFlightRequests.has(cacheKey)) return inFlightRequests.get(cacheKey);

  const promise = enqueueRequest(async () => {
    const { key: apiKey, index, isPrimary } = getActiveApiKey();
    let logMessage = 'latest news';
    if (useSearch) {
      logMessage = `search='${searchQuery}'`;
    } else if (useCategory) {
      logMessage = `category='${searchCategory}'`;
    }
    console.log(`newsAPI: Fetching articles for ${logMessage} using ${isPrimary ? 'Primary NewsData.io' : `Fallback Key ${index + 1}`}`);

    let attempt = 0;
    let backoff = 1000;

    while (attempt <= retries) {
      try {
        let response;
        
        if (isPrimary) {
          // Use NewsData.io API - build params based on query type
          const params = {
            apikey: apiKey,
            language: 'en'
          };
          
          // Add appropriate parameter
          if (useSearch) {
            params.q = searchQuery;
          } else if (useCategory) {
            params.category = searchCategory;
          }
          
          response = await axios.get(BASE_URL, {
            params,
            timeout: 15000
          });
        } else {
          // Use fallback API
          const fallbackParams = {
            language: 'en',
            country: 'in',
            page: 1,
            pageSize: 25
          };
          
          // Add query or category if we have them
          if (useSearch) {
            fallbackParams.q = searchQuery;
          } else if (useCategory) {
            fallbackParams.category = searchCategory;
          }
          
          response = await axios.get(FALLBACK_BASE_URL, {
            params: fallbackParams,
            headers: {
              Authorization: apiKey,
              'x-api-key': apiKey
            },
            timeout: 15000
          });
        }

        // increment count only on successful HTTP response
        incrementRequestCount(index, isPrimary);

        if (!response.data) {
          console.warn('newsAPI: Empty response received from provider');
          return SAMPLE_ARTICLES;
        }

        const items = response.data.results || response.data.articles || response.data.data || [];
        const results = items.map(it => ({
          title: it.title || it.headline || '',
          description: it.description || it.summary || it.content || '',
          image_url: it.image_url || it.urlToImage || it.image || it.media || '',
          link: it.link || it.url || it.source_url || '',
          source: it.source_id || (it.source && it.source.name) || it.source || it.provider || '',
          category: it.category || it.topic || '',
          country: it.country || it.origin || '',
          language: it.language || it.lang || '',
          pubDate: it.pubDate || it.publishedAt || it.published_at || it.date || ''
        }));

        if (!results || results.length === 0) {
          console.warn('newsAPI: No articles found, returning sample articles');
          cache.set(cacheKey, { ts: Date.now(), data: SAMPLE_ARTICLES });
          return SAMPLE_ARTICLES;
        }

        cache.set(cacheKey, { ts: Date.now(), data: results });
        return results;
        
      } catch (err) {
        console.error(`newsAPI: Attempt ${attempt + 1} failed:`, err.message);
        
        if (err.response) {
          if (err.response.status === 429) {
            // Rate limit hit
            const blockKey = isPrimary ? 'primary' : index;
            apiData.blockedUntil = apiData.blockedUntil || {};
            apiData.blockedUntil[blockKey] = Date.now() + 10 * 60 * 1000; // Block for 10 minutes
            saveStoredData(apiData);
            console.warn(`newsAPI: ${isPrimary ? 'Primary API' : `Fallback Key ${index + 1}`} blocked for 10 minutes due to rate limit`);
            
            // Try with a different key
            if (attempt < retries) {
              attempt++;
              await new Promise(r => setTimeout(r, backoff));
              const newApiInfo = getActiveApiKey();
              if (newApiInfo.index !== index || newApiInfo.isPrimary !== isPrimary) {
                // We got a different key, retry with it
                backoff = Math.min(5000, backoff * 1.5);
                continue;
              }
            }
          } else if (err.response.status === 403 || err.response.status === 401) {
            console.error('newsAPI: Authentication error - API key invalid');
          }
        }
        
        attempt++;
        if (attempt <= retries) {
          console.log(`newsAPI: Retrying in ${backoff}ms (attempt ${attempt}/${retries + 1})`);
          await new Promise(r => setTimeout(r, backoff));
          backoff = Math.min(5000, backoff * 1.5);
        }
      }
    }

    console.warn('newsAPI: All attempts failed, returning sample articles');
    return SAMPLE_ARTICLES;
  });

  inFlightRequests.set(cacheKey, promise);
  promise.finally(() => inFlightRequests.delete(cacheKey));
  return promise;
};

// Helper: Paginate through NewsData.io API (Python example equivalent)
// Usage: fetchAllNewsDataPages('india', 'pub_8678595cc0a84263adb9daaef622cbf4')
export const fetchAllNewsDataPages = async (query = 'india', apiKey = 'pub_8678595cc0a84263adb9daaef622cbf4') => {
  const NEWSDATA_URL = 'https://newsdata.io/api/1/news';
  const combined = [];
  let page = 1;
  try {
    while (true) {
      const resp = await axios.get(NEWSDATA_URL, {
        params: {
          apikey: apiKey,
          q: query,
          language: 'en',
          page
        },
        timeout: 15000
      });

      if (!resp || !resp.data) break;

      // collect results (NewsData commonly returns `results`)
      const items = resp.data.results || resp.data.data || [];
      const mapped = items.map(it => ({
        title: it.title || it.title_plain || '',
        description: it.description || it.summary || '',
        image_url: it.image || it.enclosure?.link || '',
        link: it.link || it.source_id || it.guid || '',
        source: it.source_id || it.source || '',
        pubDate: it.pubDate || it.pubDate || ''
      }));

      combined.push(...mapped);

      // NewsData returns nextPage or similar in top-level response
      const nextPage = resp.data.nextPage || resp.data.pagination?.nextPage || null;
      if (!nextPage) break;
      // `nextPage` may be a number or a full URL; attempt to extract the numeric page
      if (typeof nextPage === 'number') page = nextPage;
      else if (typeof nextPage === 'string') {
        const m = nextPage.match(/page=(\d+)/);
        page = m ? Number(m[1]) : page + 1;
      } else {
        page += 1;
      }
    }
  } catch (err) {
    console.error('fetchAllNewsDataPages error:', err?.response?.status, err?.response?.data || err.message);
  }
  return combined;
};
