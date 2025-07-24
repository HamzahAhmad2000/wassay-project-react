'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Circle, Info } from 'lucide-react'

const RoleSelectionStep = ({ 
  availableRoles, 
  loading, 
  onComplete, 
  selectedRole 
}) => {
  const [localSelectedRole, setLocalSelectedRole] = useState(selectedRole || null)

  const handleRoleSelect = (role) => {
    setLocalSelectedRole(role)
  }

  const handleContinue = () => {
    if (localSelectedRole) {
      onComplete(localSelectedRole)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Role</h2>
        <p className="text-gray-600">
          Select the role that best describes your intended use of the platform
        </p>
      </div>

      <div className="space-y-4">
        {availableRoles?.map((role) => (
          <Card 
            key={role.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              localSelectedRole?.id === role.id 
                ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleRoleSelect(role)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {localSelectedRole?.id === role.id ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{role.display_name || role.name}</CardTitle>
                    {role.color && (
                      <Badge 
                        variant="outline" 
                        className="mt-1"
                        style={{ borderColor: role.color, color: role.color }}
                      >
                        {role.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {role.description || `Role for ${role.display_name || role.name} users`}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableRoles?.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center space-x-3 pt-6">
            <Info className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">No roles available</p>
              <p className="text-sm text-yellow-700">
                Please contact an administrator to enable user registration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!localSelectedRole || loading}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default RoleSelectionStep 