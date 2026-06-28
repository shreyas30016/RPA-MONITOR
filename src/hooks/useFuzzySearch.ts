import { useState, useCallback, useTransition } from 'react'

export const useFuzzySearch = () => {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback((value: string) => {
    // useTransition keeps UI responsive during search computation
    startTransition(() => {
      setQuery(value)
    })
  }, [])

  return { query, handleSearch, isPending }
}
