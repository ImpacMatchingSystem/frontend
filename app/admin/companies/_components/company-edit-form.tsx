'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { Company } from '@/lib/supabase/mock-api'

interface CompanyEditFormProps {
  company: Company
  onSave: (data: Partial<Company>) => Promise<void>
  onCancel: () => void
}

export function CompanyEditForm({
  company,
  onSave,
  onCancel,
}: CompanyEditFormProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    email: company.email,
    description: company.description || '',
    website_url: company.website_url || '',
    industry: company.industry || '',
    location: company.location || '',
    is_active: company.is_active,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedData = {
        ...formData,
        description: formData.description || null,
        website_url: formData.website_url || null,
        industry: formData.industry || null,
        location: formData.location || null,
      }

      await onSave(updatedData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">기업명</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e =>
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">기업 소개</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData(prev => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">웹사이트 URL</Label>
        <Input
          id="website_url"
          type="url"
          value={formData.website_url}
          onChange={e =>
            setFormData(prev => ({ ...prev, website_url: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '수정 중...' : '수정 완료'}
        </Button>
      </div>
    </form>
  )
}
