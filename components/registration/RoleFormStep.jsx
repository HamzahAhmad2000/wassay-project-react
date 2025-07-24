'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText } from 'lucide-react'

const RoleFormStep = ({ 
  formDefinition, 
  loading, 
  onComplete, 
  onSaveDraft, 
  onBack, 
  initialData 
}) => {
  const [formData, setFormData] = useState(initialData || {})

  const handleSubmit = () => {
    onComplete({ formData })
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formData)
    }
  }

  if (!formDefinition) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Complete Registration</h2>
          <p className="text-gray-600">
            No additional information required for your role.
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Ready to proceed</p>
                <p className="text-sm text-green-700">
                  Your registration is almost complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
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
            onClick={() => onComplete({ formData: {} })}
            disabled={loading}
            className="px-8"
          >
            Complete Registration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
        <p className="text-gray-600">
          Complete the additional information required for your role
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{formDefinition.title}</CardTitle>
              <CardDescription className="mt-1">
                {formDefinition.description}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {formDefinition.fields?.length || 0} fields
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Placeholder for dynamic form */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Role-specific form fields would be rendered here based on the form definition.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This would integrate with your DynamicFormRenderer component.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
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
        
        <div className="flex space-x-3">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Submitting...' : 'Complete Registration'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RoleFormStep 