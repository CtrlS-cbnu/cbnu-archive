import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { signup } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('유효한 이메일을 입력해 주세요.').max(100),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(128),
  passwordConfirm: z.string().min(1, '필수 항목입니다.'),
  name: z.string().min(1, '필수 항목입니다.').max(50),
  studentNumber: z
    .string()
    .min(1, '학번은 필수입니다.')
    .max(20),
}).refine((data) => data.password === data.passwordConfirm, {
  // Client-side password mismatch check — not sent to server
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
})

type FormValues = z.infer<typeof schema>

export default function SignUp() {
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Redirect already-logged-in users
  if (role !== 'GUEST') {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await signup({
        email: values.email,
        password: values.password,
        name: values.name,
        studentNumber: values.studentNumber,
      })
      // After signup, send to login page so the user authenticates explicitly
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      // Show server-side error message if available (e.g. duplicate email)
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '회원가입 중 오류가 발생했습니다.'
      setError('root', { message: msg })
    }
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
  const errorClass = 'mt-1 text-xs text-red-500'

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">회원가입</h1>
      <p className="mb-8 text-center text-sm text-gray-500">충북대학교 학생 계정으로 가입하세요.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className={labelClass}>이메일</label>
          <input {...register('email')} type="email" className={inputClass} placeholder="example@cbnu.ac.kr" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        {/* Name */}
        <div>
          <label className={labelClass}>이름</label>
          <input {...register('name')} type="text" className={inputClass} placeholder="홍길동" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Student number */}
        <div>
          <label className={labelClass}>학번</label>
          <input {...register('studentNumber')} type="text" className={inputClass} placeholder="2024000000" />
          {errors.studentNumber && <p className={errorClass}>{errors.studentNumber.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className={labelClass}>비밀번호</label>
          <input {...register('password')} type="password" className={inputClass} placeholder="8자 이상" />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        {/* Password confirm */}
        <div>
          <label className={labelClass}>비밀번호 확인</label>
          <input {...register('passwordConfirm')} type="password" className={inputClass} />
          {errors.passwordConfirm && <p className={errorClass}>{errors.passwordConfirm.message}</p>}
        </div>

        {/* Server error */}
        {errors.root && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          로그인
        </Link>
      </p>
    </div>
  )
}
