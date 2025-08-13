// lib/utils/excel-utils.ts
import * as XLSX from 'xlsx'

// Excel 템플릿 다운로드 함수들만 유지 (클라이언트 사이드)

// 기업 Excel 템플릿 다운로드
export const downloadCompanyTemplate = () => {
  const template = [
    {
      기업이름: 'AI 스타트업',
      기업이메일: 'contact@aistartup.com',
      기업소개: '인공지능 기반 솔루션 개발 전문 기업',
      기업홈페이지: 'https://aistartup.com',
      비밀번호: 'company123!',
    },
    {
      기업이름: 'Green Tech',
      기업이메일: 'info@greentech.com',
      기업소개: '친환경 에너지 솔루션 제공',
      기업홈페이지: 'https://greentech.com',
      비밀번호: 'company456!',
    },
    {
      기업이름: 'FinTech Innovation',
      기업이메일: 'hello@fintech.com',
      기업소개: '금융 기술 혁신 서비스',
      기업홈페이지: 'fintech.com',
      비밀번호: 'company789!',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 20 }, // 기업이름
    { wch: 30 }, // 기업이메일
    { wch: 40 }, // 기업소개
    { wch: 30 }, // 기업홈페이지
    { wch: 15 }, // 비밀번호
  ]

  XLSX.utils.book_append_sheet(wb, ws, '기업목록')
  XLSX.writeFile(wb, '기업_업로드_템플릿.xlsx')
}

// 바이어 Excel 템플릿 다운로드
export const downloadBuyerTemplate = () => {
  const template = [
    {
      바이어이름: '김투자',
      바이어이메일: 'investor1@example.com',
      바이어소개: '시드 투자 전문가',
      바이어홈페이지: 'https://vcfund.com',
      비밀번호: 'buyer123!',
    },
    {
      바이어이름: '박벤처',
      바이어이메일: 'investor2@example.com',
      바이어소개: '스타트업 엑셀러레이터',
      바이어홈페이지: 'https://accelerator.com',
      비밀번호: 'buyer456!',
    },
    {
      바이어이름: '이펀드',
      바이어이메일: 'investor3@example.com',
      바이어소개: '후기 단계 투자 전문',
      바이어홈페이지: 'https://growthfund.com',
      비밀번호: 'buyer789!',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 15 }, // 바이어이름
    { wch: 30 }, // 바이어이메일
    { wch: 40 }, // 바이어소개
    { wch: 30 }, // 바이어홈페이지
    { wch: 15 }, // 비밀번호
  ]

  XLSX.utils.book_append_sheet(wb, ws, '바이어목록')
  XLSX.writeFile(wb, '바이어_업로드_템플릿.xlsx')

  // 사용법 안내 시트 추가
  const instructionData = [
    {
      항목: '필수 필드',
      설명: '바이어이름, 바이어이메일, 바이어소개, 바이어홈페이지, 비밀번호',
    },
    { 항목: '이메일 형식', 설명: 'example@domain.com 형식으로 입력' },
    {
      항목: '홈페이지',
      설명: 'http:// 또는 https://가 없으면 자동으로 추가됩니다',
    },
    { 항목: '비밀번호', 설명: '8자 이상 권장' },
    { 항목: '주의사항', 설명: '중복된 이메일은 업로드되지 않습니다' },
  ]

  const instructionWs = XLSX.utils.json_to_sheet(instructionData)
  instructionWs['!cols'] = [
    { wch: 15 }, // 항목
    { wch: 50 }, // 설명
  ]

  XLSX.utils.book_append_sheet(wb, instructionWs, '사용법안내')
}

// Excel 파일 읽기 유틸리티 (클라이언트 사이드에서 사용 가능)
export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Excel 파일 읽기에 실패했습니다.'))
      }
    }

    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'))
    reader.readAsBinaryString(file)
  })
}

// 데이터 검증 유틸리티들 (서버에서는 사용하지 않음)
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): string[] => {
  const errors: string[] = []

  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`${field}이(가) 필요합니다`)
    }
  }

  return errors
}

// URL 정규화 유틸리티
export const normalizeUrl = (url: string): string => {
  if (!url) return ''

  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

/**
 * 바이어 데이터를 Excel 파일로 내보내는 함수
 * @param data - 내보낼 바이어 데이터 배열
 * @param filename - 다운로드될 파일 이름
 */
export const exportBuyersToExcel = (data: any[], filename: string) => {
  const formattedData = data.map(buyer => ({
    '바이어명': buyer.name,
    '이메일': buyer.email,
    '웹사이트': buyer.website || '',
    '소개': buyer.description || '',
    '총 미팅 수': buyer._count?.buyerMeetings || 0,
    '등록일': new Date(buyer.createdAt).toLocaleDateString('ko-KR'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyers');
  XLSX.writeFile(workbook, filename);
};

 * JSON 데이터를 Excel 파일로 내보내는 함수
 * @param data - 내보낼 데이터 배열 (객체 형태)
 * @param filename - 다운로드될 파일 이름
 */
export const exportCompaniesToExcel = (data: any[], filename: string) => {
  // 데이터 형식 변환 (Excel 헤더를 한글로, 필요한 데이터만 선택)
  const formattedData = data.map(company => ({
    '기업명': company.name,
    '이메일': company.email,
    '웹사이트': company.website || '',
    '소개': company.description || '',
    '총 미팅 수': company._count?.companyMeetings || 0,
    '등록일': new Date(company.createdAt).toLocaleDateString('ko-KR'),
  }));

  // 워크시트와 워크북 생성
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

  // 파일 다운로드 트리거
  XLSX.writeFile(workbook, filename);
};