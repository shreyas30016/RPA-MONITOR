import { useRef, useState, useCallback, useEffect } from 'react'

const ROW_HEIGHT = 36      // px — fixed height for all rows
const BUFFER_ROWS = 5      // extra rows above and below viewport

export const useVirtualScroll = (totalCount: number) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [startIndex, setStartIndex] = useState(0)
  const scrollTopRef = useRef(0)

  // How many DOM nodes to render
  const getVisibleCount = useCallback(() => {
    const vh = containerRef.current?.clientHeight || 600
    return Math.ceil(vh / ROW_HEIGHT) + BUFFER_ROWS * 2
  }, [])

  const handleScroll = useCallback(() => {
    const scrollTop = containerRef.current?.scrollTop || 0
    scrollTopRef.current = scrollTop
    const newStart = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS
    )
    setStartIndex(newStart)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const visibleCount = getVisibleCount()
  const endIndex = Math.min(startIndex + visibleCount, totalCount)

  return {
    containerRef,
    startIndex,
    endIndex,
    visibleCount,
    totalHeight: totalCount * ROW_HEIGHT,
    offsetY: startIndex * ROW_HEIGHT,
    ROW_HEIGHT,
  }
}
