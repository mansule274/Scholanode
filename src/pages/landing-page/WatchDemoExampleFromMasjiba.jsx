// 📄 src/pages/VideoLibrary.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trash2, Video, Search, ArrowLeft, Loader2 } from 'lucide-react';
import privateAxiosInstance from '../../auth/privateAxiosInstance.js';
import LibraryCardSkeleton from '../components/loadingSkeletons/LibraryCardSkeleton.jsx';
import formatDate from '../util/formatDate.js';

const VideoLibrary = () => {
  const navigate = useNavigate();
  const [libraryItems, setLibraryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
 const [isFetching, setIsFetching] = useState(true); 
  const [loadingSkeleton, setLoadingSkeleton] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const isDev = import.meta.env.VITE_ENV === 'development';

  // Modal tracking state for explicit removal management
  const [videoToRemove, setVideoToRemove] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. New State for Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const previousQueryRef = useRef('');
const [isSearching, setIsSearching] = useState(false);

// Use a stable reference for the callback so it doesn't re-trigger on state changes
const lastLectureElementRef = useCallback((node) => {
  if (observer.current) observer.current.disconnect();

  observer.current = new IntersectionObserver(entries => {
    // Check current state values inside the callback via logic
    if (entries[0].isIntersecting) {
      // Use a functional update to avoid needing 'page' in the dependency array
      setPage(prev => {
       
        return prev + 1;
      });
    }
  }, { rootMargin: '200px' });

  if (node) observer.current.observe(node);
}, []); // <--- EMPTY DEPENDENCIES: This will never change

  // Debounce the search query before requesting new results
  useEffect(() => {
    clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 600);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [searchQuery]);

  // Fetch library on mount, search change, or page change
  useEffect(() => {
    if (previousQueryRef.current !== debouncedSearchQuery && page !== 1) {
      setIsSearching(debouncedSearchQuery.length > 0);

      previousQueryRef.current = debouncedSearchQuery;
      setPage(1);
      setHasMore(true);
      return;
    }

    previousQueryRef.current = debouncedSearchQuery;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadLibrary = async () => {
     if (!hasMore && page !== 1) return;
  try {
    setIsFetching(true); // Set to true at start of fetch
    const res = await privateAxiosInstance.get('/video-library/get-library', {
      params: { page, search: debouncedSearchQuery, limit: 15 },
      signal: controller.signal,
    });

    if (res.status < 400) {
      const { library, hasMore: serverHasMore, totalResults } = res.data;
      setLibraryItems(prev => (page === 1 ? library : [...prev, ...library]));
      setHasMore(serverHasMore);
      setTotalCount(totalResults);
      setLoadingSkeleton(false);
    }

      
      } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
    return; 
  }
        if (isDev) {
          console.error('Failed fetching library:', err?.response?.data || err);
        }
      } finally {
        setIsFetching(false);
        setLoadingSkeleton(false);
      }
    };

    loadLibrary();

    return () => {
      controller.abort();
    };
  }, [page, debouncedSearchQuery]);


  // Handle explicit delete via our custom DELETE route
  const handleConfirmDelete = async () => {
    if (!videoToRemove) return;
    setIsDeleting(true);
    try {
      // 1. Use the correct endpoint ID
      const res = await privateAxiosInstance.delete(`/video-library/remove/${videoToRemove.id}`);

      if (res.status < 400) {
        // 2. Filter using the correct ID property
        setLibraryItems(prev => prev.filter(item => item.id !== videoToRemove.id));
        setVideoToRemove(null);
      }
    } catch (err) {
      if (isDev) {
        console.error("Failed removing target video item:", err?.response?.data ||err);
      }
    } finally {
      setIsDeleting(false);
    }
  };



return (
  <div className="min-h-screen bg-gray-50 pt-6 pb-12 px-4 sm:px-6 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* 🌟 1. Navigation & Content Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white text-emerald-800 shadow-xs border border-gray-100 hover:bg-emerald-50 transition cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Video Library</h1>
            <p className="text-sm text-gray-500 font-medium">
              {totalCount} {totalCount === 1 ? 'lecture' : 'lectures'} securely cached
            </p>
          </div>
        </div>

        {(libraryItems.length > 0 || searchQuery.length > 0) && (
          <div className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden px-4 shadow-xs w-full sm:w-72 md:w-80 h-11">
            <Search className="text-gray-400 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search your library items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full outline-hidden bg-transparent placeholder:text-gray-400 pl-2 text-sm text-gray-800"
            />
          </div>
        )}
      </div>

      {/* 🌟 2. Refined Conditional State Display Handling */}
      {loadingSkeleton ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
          <p className="text-gray-500 text-sm font-semibold tracking-wide animate-pulse">Loading saved storage slots...</p>
        </div>
      ) : libraryItems.length === 0 && !isFetching ? (
        /* Show Empty state only if NOT fetching and list is empty */
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto mt-12 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mb-5">
            <Video className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {debouncedSearchQuery ? "No matches found" : "Your Shelf is Empty"}
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
            {debouncedSearchQuery 
              ? `We couldn't find any items matching "${debouncedSearchQuery}". Please try a different search term.` 
              : "Keep your favorite video lectures organized here. Click the download icon on any video lecture to add it to your personal library for quick and easy access anytime."}
          </p>
          {!debouncedSearchQuery && (
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-linear-to-r from-emerald-800 to-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md hover:opacity-95 transition tracking-wide cursor-pointer"
            >
              Browse Lectures
            </button>
          )}
        </div>
      ) : (
        /* 🌟 3. Video Grid Display (Also visible during fetch) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {libraryItems.map((lec, index) => {
            if (!lec) return null;
            const isLastElement = libraryItems.length === index + 1;
            return (
              <div key={lec.id} ref={isLastElement ? lastLectureElementRef : null}>
                <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div onClick={() => navigate("/video-player", { state: { lecture: lec, fromBookmark: false } })} className="relative aspect-video w-full bg-gray-900 overflow-hidden cursor-pointer">
                    {lec.thumbnail ? (
                      <img src={lec.thumbnail} alt={lec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-emerald-950 to-emerald-800 text-white/40">
                        <Video className="w-12 h-12 mb-1 opacity-60" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300/60">Masjid Lecture</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    {lec.duration && <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[11px] px-1.5 py-0.5 rounded-sm tracking-wide">{lec.duration}</span>}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-snug text-nowrap">{lec.title || "Untitled Lecture"}</h4>
                      <div className="mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-nowrap text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                          {lec?.mosqueName || "Unnamed Mosque"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                      <span className="text-[11px] text-gray-400 font-medium text-nowrap">
                        Added {formatDate(lec.addedToLibraryAt)}
                      </span>
                      <button title="Remove" onClick={(e) => { e.stopPropagation(); setVideoToRemove(lec); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer ml-10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show small loader at bottom when loading additional pages */}
      {isFetching && libraryItems.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
        </div>
      )}

      {/* 🌟 4. Action Confirmation Safety Modal */}
      {videoToRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="text-red-500 w-5 h-5" /> Remove from Library?
            </h3>
            <p className="text-sm text-gray-600 mt-3">Are you sure you want to drop this recording entry?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button disabled={isDeleting} onClick={() => setVideoToRemove(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer">Cancel</button>
              <button disabled={isDeleting} onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs cursor-pointer">{isDeleting ? "Dropping..." : "Confirm Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default VideoLibrary;