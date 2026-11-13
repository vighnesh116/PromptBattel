import type { TransportRequest } from '../types';

const STORAGE_KEY = 'resq-demo-transport-requests';

export function getDemoTransportRequests(): TransportRequest[] {
  const storedRequests = window.localStorage.getItem(STORAGE_KEY);
  return storedRequests ? (JSON.parse(storedRequests) as TransportRequest[]) : [];
}

export function saveDemoTransportRequests(requests: TransportRequest[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function updateDemoTransportRequest(
  requestId: string,
  updates: Partial<TransportRequest>
): TransportRequest | null {
  const requests = getDemoTransportRequests();
  const request = requests.find((item) => item.id === requestId);
  if (!request) return null;

  Object.assign(request, updates, { updated_at: new Date().toISOString() });
  saveDemoTransportRequests(requests);
  window.dispatchEvent(new Event('demo-transport-requests-updated'));
  return request;
}
