import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for infinite scrolling
 * @param {Array} allItems - The full list of items to paginate
 * @param {number} pageSize - Number of items to show per page
 */
export function useInfiniteScroll(allItems, pageSize = 8) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  useEffect(() => {
    setVisibleItems(allItems.slice(0, page * pageSize));
  }, [allItems, page, pageSize]);

  const loadMore = useCallback(() => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      const nextItems = allItems.slice(0, nextPage * pageSize);
      if (nextItems.length !== visibleItems.length) {
        return nextPage;
      }
      return prevPage;
    });
  }, [allItems, pageSize, visibleItems.length]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMore]);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    visibleItems,
    loaderRef,
    hasMore: visibleItems.length < allItems.length,
    resetPagination,
    page
  };
}
