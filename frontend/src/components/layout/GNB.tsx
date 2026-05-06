import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'

export function GNB() {
  const { role } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Ignore API error — always clear local auth state
    } finally {
      useAuthStore.getState().logout()
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary-700 bg-primary-600 shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold text-white">
          AI Archive
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/projects" className="text-primary-100 hover:text-white transition-colors">
            프로젝트
          </Link>
          <Link to="/chat" className="text-primary-100 hover:text-white transition-colors">
            AI 탐색
          </Link>
          {role === 'USER' || role === 'ADMIN' ? (
            <>
              <Link to="/my" className="text-primary-100 hover:text-white transition-colors">
                내 프로젝트
              </Link>
              {role === 'ADMIN' && (
                <Link to="/admin/pending" className="text-primary-100 hover:text-white transition-colors">
                  관리
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-primary-100 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-white px-3 py-1.5 font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
