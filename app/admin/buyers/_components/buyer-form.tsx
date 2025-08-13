'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const buyerFormSchema = z.object({
    name: z.string().min(1, '이름은 필수 항목입니다.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.').optional().or(z.literal('')),
    description: z.string().optional(),
    website: z.string().optional(),
})

type BuyerFormData = z.infer<typeof buyerFormSchema>

interface BuyerFormProps {
    initialData?: BuyerFormData
    onSave: (data: Partial<BuyerFormData> & { role: 'BUYER' }) => Promise<void>
    onCancel: () => void
}

export function BuyerForm({ initialData, onSave, onCancel }: BuyerFormProps) {
    const { toast } = useToast()
    const isEditMode = !!initialData

    const form = useForm<BuyerFormData>({
        resolver: zodResolver(buyerFormSchema),
        defaultValues: initialData || {
            name: '', email: '', password: '', description: '', website: '',
        },
    })

    const onSubmit = async (data: BuyerFormData) => {
        try {
            const finalData = { ...data }
            if (isEditMode && !finalData.password) {
                delete finalData.password
            }
            await onSave({ ...finalData, role: 'BUYER' })
        } catch (error) {
            toast({
                title: '저장 실패',
                description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>바이어명 *</FormLabel>
                                <FormControl><Input placeholder="바이어 이름을 입력하세요" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>이메일 *</FormLabel>
                                <FormControl><Input type="email" placeholder="contact@buyer.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>비밀번호 {isEditMode ? '(변경할 때만 입력)' : '*'}</FormLabel>
                            <FormControl><Input type="password" placeholder={isEditMode ? '변경하려면 새 비밀번호 입력' : ''} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>웹사이트</FormLabel>
                            <FormControl><Input type="url" placeholder="https://buyer.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>소개</FormLabel>
                            <FormControl><Textarea placeholder="바이어에 대한 간단한 소개를 입력하세요" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
                        취소
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? '저장 중...' : '저장'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}