import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { GNB } from './GNB'

export function PageWrapper() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GNB />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
