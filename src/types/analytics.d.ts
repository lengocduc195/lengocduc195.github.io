// Extend Window interface to include gtag
interface Window {
  gtag: (
    command: 'config' | 'event' | 'set',
    targetId: string,
    config?: Record<string, any> | undefined
  ) => void;
}
