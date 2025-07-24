'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock } from 'lucide-react'

const BasicInfoStep = ({ 
  loading, 
  onComplete, 
  onBack, 
  selectedRole, 
  initialData 
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: initialData?.username || '',
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      password: '',
      confirm_password: ''
    }
  })

  const password = watch('password')

  const validatePassword = (value) => {
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character'
    return true
  }

  const validateConfirmPassword = (value) => {
    if (value !== password) return 'Passwords do not match'
    return true
  }

  const onSubmit = (data) => {
    if (loading) return
    onComplete(data)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-gray-600">
          Enter your information to get started
        </p>
      </div>

      {selectedRole && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-medium text-blue-900">Selected Role</p>
              <p className="text-sm text-blue-700">{selectedRole.display_name || selectedRole.name}</p>
            </div>
            <Badge 
              variant="outline"
              className="border-blue-500 text-blue-700"
            >
              {selectedRole.name}
            </Badge>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Username</span>
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a unique username"
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_-]+$/,
                message: 'Username can only contain letters, numbers, underscores, and hyphens'
              }
            })}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>First Name</span>
            </Label>
            <Input
              id="first_name"
              type="text"
              placeholder="Enter your first name"
              {...register('first_name', { 
                required: 'First name is required',
                minLength: { value: 2, message: 'First name must be at least 2 characters' }
              })}
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && (
              <p className="text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Last Name</span>
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Enter your last name"
              {...register('last_name', { 
                required: 'Last name is required',
                minLength: { value: 2, message: 'Last name must be at least 2 characters' }
              })}
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password', { validate: validatePassword })}
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Confirm Password</span>
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirm_password', { validate: validateConfirmPassword })}
              className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
          {errors.confirm_password && (
            <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Button
            type="submit"
            disabled={!isValid || loading}
            className="px-8"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BasicInfoStep 