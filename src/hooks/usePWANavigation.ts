import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const usePWANavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for navigation messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_TO') {
        const url = new URL(event.data.url);
        const pathname = url.pathname;
        
        // Navigate to the appropriate route within the PWA
        navigate(pathname);
      }
    };

    // Check if we're in a PWA context
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://');

    if (isPWA && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Register this client as PWA for link handling
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'PWA_CLIENT_READY'
          });
        }
      });
    }

    // Handle custom URL schemes or deep links on startup
    const handleDeepLink = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const deepLink = urlParams.get('url');
      
      if (deepLink) {
        try {
          const decodedUrl = decodeURIComponent(deepLink);
          const url = new URL(decodedUrl);
          navigate(url.pathname);
        } catch (error) {
          console.error('Error parsing deep link:', error);
        }
      }
    };

    // Check for deep link on component mount
    handleDeepLink();

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [navigate]);

  // Function to generate PWA-friendly links
  const generateInviteLink = (token: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/convite/${token}`;
  };

  // Function to share a link that will open in PWA if installed
  const shareInviteLink = async (token: string): Promise<void> => {
    const link = generateInviteLink(token);
    
    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Convite - INTELLBANK',
          text: 'Você foi convidado para acessar o sistema',
          url: link,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(link);
        
        // Notify service worker about the link for PWA handling
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'REGISTER_INVITE_LINK',
            link: link
          });
        }
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      // Fallback to clipboard
      await navigator.clipboard.writeText(link);
    }
  };

  return {
    generateInviteLink,
    shareInviteLink,
  };
};