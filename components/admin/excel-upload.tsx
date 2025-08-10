'use client'

import type React from 'react'
import { useState } from 'react'

import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { useToast } from '@/hooks/use-toast'

import {
  downloadCompanyTemplate,
  downloadBuyerTemplate,
} from '@/lib/utils/excel-utils'

interface ExcelUploadProps {
  type: 'COMPANY' | 'BUYER'
  onUploadComplete?: () => void
}

interface UploadResult {
  message: string
  results: Array<{
    row: number
    success: boolean
    user?: any
  }>
  errors: Array<{
    row: number
    error: string
    data: any
  }>
  summary: {
    total: number
    success: number
    failed: number
  }
}

export function ExcelUpload({ type, onUploadComplete }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<UploadResult | null>(null)

  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Excel 파일 형식 체크
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ]

      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: '파일 형식 오류',
          description: 'Excel 파일(.xlsx, .xls)만 업로드 가능합니다.',
          variant: 'destructive',
        })
        return
      }

      // 파일 크기 체크 (최대 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: '파일 크기 오류',
          description: '파일 크기는 10MB를 초과할 수 없습니다.',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('excel-file', file)
      formData.append('type', type)

      setProgress(20)

      // 실제 API 호출
      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
      })

      setProgress(60)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const uploadResult: UploadResult = await response.json()

      setProgress(100)
      setResults(uploadResult)

      // 성공 메시지
      if (uploadResult.summary.success > 0) {
        toast({
          title: '업로드 완료',
          description: uploadResult.message,
        })

        // 업로드 완료 콜백 호출
        onUploadComplete?.()
      }

      // 오류가 있지만 일부 성공한 경우
      if (uploadResult.summary.failed > 0 && uploadResult.summary.success > 0) {
        toast({
          title: '부분 성공',
          description: `${uploadResult.summary.success}개 성공, ${uploadResult.summary.failed}개 실패`,
          variant: 'default',
        })
      }

      // 모든 항목이 실패한 경우
      if (
        uploadResult.summary.failed > 0 &&
        uploadResult.summary.success === 0
      ) {
        toast({
          title: '업로드 실패',
          description:
            '모든 항목의 업로드에 실패했습니다. 오류 내용을 확인해주세요.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setResults(null)
      toast({
        title: '업로드 실패',
        description:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDownloadTemplate = () => {
    try {
      if (type === 'COMPANY') {
        downloadCompanyTemplate()
      } else {
        downloadBuyerTemplate()
      }

      toast({
        title: '템플릿 다운로드',
        description: '템플릿 파일이 다운로드되었습니다.',
      })
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '템플릿 다운로드에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  const resetUpload = () => {
    setFile(null)
    setResults(null)
    setProgress(0)
  }

  const typeDisplayName = type === 'COMPANY' ? '기업' : '바이어'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel {typeDisplayName} 일괄 업로드
        </CardTitle>
        <CardDescription>
          Excel 파일을 사용하여 {typeDisplayName} 데이터를 일괄로 업로드할 수
          있습니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 템플릿 다운로드 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h4 className="font-medium text-blue-900">템플릿 다운로드</h4>
            <p className="text-sm text-blue-700">
              올바른 형식의 Excel 템플릿을 다운로드하여 사용하세요.
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            템플릿 다운로드
          </Button>
        </div>

        {/* 파일 업로드 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="excel-file">Excel 파일 선택</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
              className="mt-1"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                disabled={uploading}
              >
                제거
              </Button>
            </div>
          )}

          {/* 업로드 진행률 */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>업로드 진행중...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* 업로드 버튼 */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? '업로드 중...' : '업로드 시작'}
          </Button>
        </div>

        {/* 결과 표시 */}
        {results && (
          <div className="space-y-4">
            {/* 성공 알림 */}
            {results.summary.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{results.summary.success}개 항목</strong>이 성공적으로
                  업로드되었습니다.
                </AlertDescription>
              </Alert>
            )}

            {/* 오류 알림 */}
            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>{results.errors.length}개 오류</strong>가
                    발생했습니다:
                    <ul className="mt-2 space-y-1 text-sm max-h-40 overflow-y-auto">
                      {results.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="list-disc list-inside">
                          행 {error.row}: {error.error}
                        </li>
                      ))}
                      {results.errors.length > 10 && (
                        <li className="text-gray-600">
                          ... 외 {results.errors.length - 10}개 오류
                        </li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 상세 통계 */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {results.summary.total}
                </div>
                <div className="text-sm text-gray-600">총 항목</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.success}
                </div>
                <div className="text-sm text-gray-600">성공</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.failed}
                </div>
                <div className="text-sm text-gray-600">실패</div>
              </div>
            </div>
          </div>
        )}

        {/* 사용법 안내 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">사용법</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>
              위의 "템플릿 다운로드" 버튼을 클릭하여 Excel 템플릿을
              다운로드합니다.
            </li>
            <li>템플릿에 맞춰 {typeDisplayName} 데이터를 입력합니다.</li>
            <li>
              완성된 Excel 파일을 선택하고 "업로드 시작" 버튼을 클릭합니다.
            </li>
            <li>
              업로드 결과를 확인하고 오류가 있다면 수정 후 다시 업로드합니다.
            </li>
          </ol>

          {/* 필수 필드 안내 */}
          <div className="mt-3 p-3 bg-white rounded border">
            <h5 className="font-medium text-gray-900 mb-1">필수 필드</h5>
            <div className="text-sm text-gray-600">
              {type === 'COMPANY' ? (
                <span>
                  기업이름, 기업이메일, 기업소개, 기업홈페이지, 비밀번호
                </span>
              ) : (
                <span>
                  바이어이름, 바이어이메일, 바이어소개, 바이어홈페이지, 비밀번호
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
