import { useEffect, useState } from 'react'
import { getAccessToken } from './localAuth'
import { getTeacherItems, subscribeTeacherContent, syncTeacherItemsFromBackend, type TeacherGameKey } from './teacherContent'

export function useTeacherItems<T>(key: TeacherGameKey) {
  const [items, setItems] = useState<T[]>(() => getTeacherItems<T>(key))

  useEffect(() => {
    setItems(getTeacherItems<T>(key))

    const unsubscribe = subscribeTeacherContent((changedKey) => {
      if (!changedKey || changedKey === key) {
        setItems(getTeacherItems<T>(key))
      }
    })

    if (getAccessToken()) {
      void syncTeacherItemsFromBackend<T>(key)
        .then((next) => setItems(next))
        .catch(() => {
          // keep local cache if backend fetch fails
        })
    }

    return unsubscribe
  }, [key])

  return items
}
