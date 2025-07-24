'use client'

import { CheckCircle, Mail, User, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const RegistrationComplete = ({ user, onGoToLogin, onRestart }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Complete!</h2>
          <p className="text-gray-600 mt-2">
            Your account has been successfully created.
          </p>
        </div>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-green-800">1</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Check your email</p>
              <p className="text-sm text-green-700">
                We've sent verification instructions to your email address.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-green-800">2</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Sign in</p>
              <p className="text-sm text-green-700">
                Use your credentials to access your account.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-green-800">3</span>
            </div>
            <div>
              <p className="font-medium text-green-800">Complete your profile</p>
              <p className="text-sm text-green-700">
                Add additional information to personalize your experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Summary */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Summary</CardTitle>
            <CardDescription>
              Review your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.basicInfo?.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{user.basicInfo.email}</span>
              </div>
            )}
            
            {(user.basicInfo?.first_name || user.basicInfo?.last_name) && (
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">
                  {user.basicInfo.first_name} {user.basicInfo.last_name}
                </span>
              </div>
            )}
            
            {user.selectedRole && (
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.selectedRole.color || '#3b82f6' }}
                />
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant="outline">
                  {user.selectedRole.display_name || user.selectedRole.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onGoToLogin}
          className="flex items-center justify-center space-x-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Sign In Now</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRestart}
          className="flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Register Another Account</span>
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Didn't receive the verification email? Check your spam folder or{' '}
          <button className="text-blue-600 hover:text-blue-500 underline">
            contact support
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegistrationComplete 