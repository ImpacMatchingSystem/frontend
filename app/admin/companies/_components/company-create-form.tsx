"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Company } from "@/lib/supabase/mock-api"

const INDUSTRIES = [
  "IT/소프트웨어", "제조업", "금융", "의료/헬스케어", "교육", 
  "유통/소매", "건설/부동산", "운송/물류", "미디어/광고", "기타"
]

const LOCATIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", 
  "세종", "경기", "강원", "충북", "충남", "전북", "전남", 
  "경북", "경남", "제주", "해외"
]

interface CompanyCreateFormProps {
  onSave: (data: Omit<Company, "id" | "created_at">) => Promise<void>
  onCancel: () => void
}

export function CompanyCreateForm({ onSave, onCancel }: CompanyCreateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    website_url: "",
    industry: "",
    location: "",
    is_active: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const cleanedData = {
        ...formData,
        description: formData.description || null,
        website_url: formData.website_url || null,
        industry: formData.industry || null,
        location: formData.location || null,
        password_hash: formData.password || null,
        logo_url: null,
        available_times: {},
        settings: { email_notifications: true },
      }

      await onSave(cleanedData)
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
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">임시 비밀번호 *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          required
          placeholder="기업에서 사용할 임시 비밀번호를 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">기업 소개</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="기업에 대한 간단한 소개를 입력하세요"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">업종</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="업종 선택" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">지역</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">웹사이트 URL</Label>
        <Input
          id="website_url"
          type="url"
          value={formData.website_url}
          onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">생성 후 즉시 활성화</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "생성 중..." : "기업 생성"}
        </Button>
      </div>
    </form>
  )
}