import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RecentPage {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  thumbnail?: string;
  description?: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  color?: string;
  timestamp: number;
}

interface SavedSearch {
  id: string;
  query: string;
  filters: Record<string, any>;
  timestamp: number;
  notificationEnabled: boolean;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

export function useEnterpriseNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recent Pages State
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [sidebarSections, setSidebarSections] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = {
      recentPages: localStorage.getItem('enterprise-recent-pages'),
      bookmarks: localStorage.getItem('enterprise-bookmarks'),
      savedSearches: localStorage.getItem('enterprise-saved-searches'),
      sidebarOrder: localStorage.getItem('enterprise-sidebar-order'),
    };

    if (stored.recentPages) {
      setRecentPages(JSON.parse(stored.recentPages));
    }
    if (stored.bookmarks) {
      setBookmarks(JSON.parse(stored.bookmarks));
    }
    if (stored.savedSearches) {
      setSavedSearches(JSON.parse(stored.savedSearches));
    }
  }, []);

  // Add to recent pages
  const addToRecentPages = useCallback((title: string, description?: string) => {
    const newPage: RecentPage = {
      id: crypto.randomUUID(),
      title,
      url: location.pathname,
      timestamp: Date.now(),
      description,
      thumbnail: generateThumbnailUrl(location.pathname),
    };

    setRecentPages(prev => {
      const filtered = prev.filter(page => page.url !== location.pathname);
      const updated = [newPage, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('enterprise-recent-pages', JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  // Bookmark management
  const addBookmark = useCallback((title: string, url?: string, icon?: string, color?: string) => {
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      title,
      url: url || location.pathname,
      icon,
      color,
      timestamp: Date.now(),
    };

    setBookmarks(prev => {
      const updated = [bookmark, ...prev];
      localStorage.setItem('enterprise-bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('enterprise-bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((url?: string) => {
    const checkUrl = url || location.pathname;
    return bookmarks.some(b => b.url === checkUrl);
  }, [bookmarks, location.pathname]);

  // Saved searches
  const saveSearch = useCallback((query: string, filters: Record<string, any>, notificationEnabled = false) => {
    const savedSearch: SavedSearch = {
      id: crypto.randomUUID(),
      query,
      filters,
      timestamp: Date.now(),
      notificationEnabled,
    };

    setSavedSearches(prev => {
      const updated = [savedSearch, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem('enterprise-saved-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('enterprise-saved-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Keyboard shortcuts
  const keyboardShortcuts: KeyboardShortcut[] = [
    {
      key: 'Ctrl+1',
      description: 'Dashboard',
      action: () => navigate('/'),
    },
    {
      key: 'Ctrl+2',
      description: 'Clientes',
      action: () => navigate('/clientes'),
    },
    {
      key: 'Ctrl+3',
      description: 'Contratos',
      action: () => navigate('/contratos'),
    },
    {
      key: 'Ctrl+4',
      description: 'Processos',
      action: () => navigate('/processos'),
    },
    {
      key: 'Ctrl+5',
      description: 'Acordos',
      action: () => navigate('/acordos'),
    },
    {
      key: 'Ctrl+6',
      description: 'Cálculos',
      action: () => navigate('/calculos'),
    },
    {
      key: 'Ctrl+K',
      description: 'Busca Global',
      action: () => {
        const event = new CustomEvent('open-global-search');
        window.dispatchEvent(event);
      },
    },
    {
      key: 'Ctrl+B',
      description: 'Toggle Bookmark',
      action: () => {
        if (isBookmarked()) {
          const bookmark = bookmarks.find(b => b.url === location.pathname);
          if (bookmark) removeBookmark(bookmark.id);
        } else {
          addBookmark(document.title || 'Página sem título');
        }
      },
    },
  ];

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      const shortcut = keyboardShortcuts.find(s => {
        const keys = s.key.toLowerCase().split('+');
        const hasCtrl = keys.includes('ctrl') && event.ctrlKey;
        const hasAlt = keys.includes('alt') && event.altKey;
        const hasShift = keys.includes('shift') && event.shiftKey;
        const key = keys[keys.length - 1];
        
        return (
          hasCtrl &&
          !event.altKey &&
          !event.shiftKey &&
          event.key.toLowerCase() === key
        ) || (
          hasAlt &&
          !event.ctrlKey &&
          !event.shiftKey &&
          event.key.toLowerCase() === key
        ) || (
          hasShift &&
          !event.ctrlKey &&
          !event.altKey &&
          event.key.toLowerCase() === key
        );
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcuts, isBookmarked, bookmarks, location.pathname]);

  // Generate breadcrumb path
  const generateBreadcrumbs = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ title: 'Home', url: '/' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ title, url: currentPath });
    });

    return breadcrumbs;
  }, [location.pathname]);

  return {
    // Recent Pages
    recentPages,
    addToRecentPages,
    
    // Bookmarks
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    
    // Saved Searches
    savedSearches,
    saveSearch,
    removeSavedSearch,
    
    // Keyboard Shortcuts
    keyboardShortcuts,
    
    // Breadcrumbs
    generateBreadcrumbs,
    
    // Sidebar
    sidebarSections,
    setSidebarSections,
  };
}

// Helper function to generate thumbnail URLs (placeholder)
function generateThumbnailUrl(pathname: string): string {
  // In a real app, this would generate actual thumbnails
  const hash = pathname.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return `https://picsum.photos/200/120?random=${Math.abs(hash)}`;
}