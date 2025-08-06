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
  readExcelFile,
  validateCompanyData,
  validateBuyerData,
  uploadCompanies,
  uploadBuyers,
  downloadCompanyTemplate,
  downloadBuyerTemplate,
} from '@/lib/utils/excel-utils'

interface ExcelUploadProps {
  type: 'companies' | 'buyers'
  onUploadComplete?: () => void
}

export function ExcelUpload({ type, onUploadComplete }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)

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

      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // 1. 파일 읽기
      setProgress(20)
      const data = await readExcelFile(file)

      if (data.length === 0) {
        throw new Error('Excel 파일에 데이터가 없습니다.')
      }

      // 2. 데이터 검증
      setProgress(40)
      let validationResult

      if (type === 'companies') {
        validationResult = validateCompanyData(data)
      } else {
        validationResult = validateBuyerData(data)
      }

      if (
        validationResult.errors.length > 0 &&
        validationResult.valid.length === 0
      ) {
        setResults({
          success: 0,
          errors: validationResult.errors,
        })
        return
      }

      // 3. 데이터 업로드
      setProgress(60)
      let uploadResult

      if (type === 'companies') {
        uploadResult = await uploadCompanies(validationResult.valid)
      } else {
        uploadResult = await uploadBuyers(validationResult.valid)
      }

      setProgress(100)

      // 4. 결과 설정
      const allErrors = [...validationResult.errors, ...uploadResult.errors]
      setResults({
        success: uploadResult.success,
        errors: allErrors,
      })

      if (uploadResult.success > 0) {
        toast({
          title: '업로드 완료',
          description: `${uploadResult.success}개 항목이 성공적으로 업로드되었습니다.`,
        })

        onUploadComplete?.()
      }
    } catch (error) {
      console.error('Upload error:', error)
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
    if (type === 'companies') {
      downloadCompanyTemplate()
    } else {
      downloadBuyerTemplate()
    }
  }

  const resetUpload = () => {
    setFile(null)
    setResults(null)
    setProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel {type === 'companies' ? '기업' : '바이어'} 일괄 업로드
        </CardTitle>
        <CardDescription>
          Excel 파일을 사용하여 {type === 'companies' ? '기업' : '바이어'}{' '}
          데이터를 일괄로 업로드할 수 있습니다.
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
              <Button variant="ghost" size="sm" onClick={resetUpload}>
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
            {results.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{results.success}개 항목</strong>이 성공적으로
                  업로드되었습니다.
                </AlertDescription>
              </Alert>
            )}

            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>{results.errors.length}개 오류</strong>가
                    발생했습니다:
                    <ul className="mt-2 space-y-1 text-sm">
                      {results.errors.slice(0, 10).map((error, index) => (
                        <li key={index} className="list-disc list-inside">
                          {error}
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
            <li>템플릿에 맞춰 데이터를 입력합니다.</li>
            <li>
              완성된 Excel 파일을 선택하고 "업로드 시작" 버튼을 클릭합니다.
            </li>
            <li>
              업로드 결과를 확인하고 오류가 있다면 수정 후 다시 업로드합니다.
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
