'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CompanyDataType {
  name: string
  email: string
  password: string
  role: 'COMPANY'
  description?: string
  website?: string
}

interface CompanyCreateFormProps {
  onSave: (data: CompanyDataType) => Promise<void>
  onCancel: () => void
}

export function CompanyCreateForm({
  onSave,
  onCancel,
}: CompanyCreateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    description: '',
    website: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // ImpacMatching API 형식에 맞게 데이터 구성
      const apiData: CompanyDataType = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'COMPANY',
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
      }

      await onSave(apiData)
    } catch (error) {
      console.error('회사 생성 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">기업명 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e =>
              setFormData(prev => ({ ...prev, name: e.target.value }))
            }
            required
            placeholder="기업명을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">기업 이메일 *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e =>
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            required
            placeholder="contact@company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호 *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={e =>
            setFormData(prev => ({ ...prev, password: e.target.value }))
          }
          required
          placeholder="기업에서 사용할 비밀번호를 입력하세요"
          minLength={6}
        />
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
          placeholder="기업에 대한 간단한 소개를 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">웹사이트 URL</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={e =>
            setFormData(prev => ({ ...prev, website: e.target.value }))
          }
          placeholder="https://company.com 또는 company.com"
        />
        <p className="text-sm text-gray-500">
          http:// 또는 https://가 없으면 자동으로 https://가 추가됩니다.
        </p>
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
          {isSubmitting ? '생성 중...' : '기업 생성'}
        </Button>
      </div>
    </form>
  )
}