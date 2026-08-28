import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'المشاريع', href: '/projects' },
    { title: 'إضافة مشروع', href: '#' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        short_description: '',
        description: '',
        team_name: '',
        department: '',
        category: '',
        technologies: '',
        demo_url: '',
        is_published: true,
        display_order: 0,
        cover_image: null as File | null,
        members: [] as { name: string; role: string }[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects');
    };

    const handleSlugify = (text: string) => {
        const slug = text
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
        setData('slug', slug);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="إضافة مشروع جديد — المعرض التقني" />
            <div
                className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8 font-sans"
                dir="rtl"
            >
                {/* Form Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="font-heading text-[28px] font-bold tracking-tight text-foreground">
                            إضافة مشروع جديد
                        </h1>
                        <p className="mt-1 text-[14px] text-secondary-foreground">
                            أدخل تفاصيل المشروع الجديد لإضافته إلى سجل المعرض
                        </p>
                    </div>
                </div>

                <div className="rounded-[24px] border border-border/40 bg-card p-6 shadow-sm sm:p-8">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="name"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        اسم المشروع *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => {
                                            setData('name', e.target.value);
                                            if (!data.slug)
                                                handleSlugify(e.target.value);
                                        }}
                                        className="h-10 bg-background"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="slug"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        الرابط المخصص (Slug) *
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) =>
                                            setData('slug', e.target.value)
                                        }
                                        className="h-10 bg-background font-mono text-[13px]"
                                        dir="ltr"
                                        required
                                    />
                                    {errors.slug && (
                                        <p className="text-xs text-destructive">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="short_description"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    الوصف المختصر (يظهر في الدليل وبطاقة
                                    المشروع)
                                </Label>
                                <Input
                                    id="short_description"
                                    value={data.short_description}
                                    onChange={(e) =>
                                        setData(
                                            'short_description',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 bg-background"
                                />
                                {errors.short_description && (
                                    <p className="text-xs text-destructive">
                                        {errors.short_description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="description"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    الوصف التفصيلي
                                </Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={4}
                                    className="w-full rounded-[12px] border border-input bg-background px-3 py-3 font-sans text-sm text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div className="border-border-subtle space-y-5 border-t pt-8">
                            <h2 className="font-heading text-[16px] font-bold text-foreground">
                                بيانات الفريق والتخصص
                            </h2>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="team_name"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        اسم الفريق
                                    </Label>
                                    <Input
                                        id="team_name"
                                        value={data.team_name}
                                        onChange={(e) =>
                                            setData('team_name', e.target.value)
                                        }
                                        className="h-10 bg-background"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="department"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        القسم / التخصص
                                    </Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) =>
                                            setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                        className="h-10 bg-background"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="category"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        فئة المشروع
                                    </Label>
                                    <Input
                                        id="category"
                                        value={data.category}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                        className="h-10 bg-background"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="technologies"
                                        className="text-[13px] font-medium text-foreground"
                                    >
                                        التقنيات المستخدمة
                                    </Label>
                                    <Input
                                        id="technologies"
                                        value={data.technologies}
                                        onChange={(e) =>
                                            setData(
                                                'technologies',
                                                e.target.value,
                                            )
                                        }
                                        className="h-10 bg-background font-mono text-[13px]"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="demo_url"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    رابط العرض الحي (اختياري)
                                </Label>
                                <Input
                                    id="demo_url"
                                    type="url"
                                    value={data.demo_url}
                                    onChange={(e) =>
                                        setData('demo_url', e.target.value)
                                    }
                                    className="h-10 bg-background font-mono text-[13px]"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="cover_image"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    صورة المشروع
                                </Label>
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'cover_image',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="h-10 bg-background pt-2 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Checkbox
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'is_published',
                                            checked === true,
                                        )
                                    }
                                    className="h-5 w-5 rounded-[4px]"
                                />
                                <Label
                                    htmlFor="is_published"
                                    className="cursor-pointer text-[14px] font-medium text-foreground select-none"
                                >
                                    نشر المشروع في دليل المعرض فوراً
                                </Label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-8">
                            <Button
                                variant="ghost"
                                type="button"
                                asChild
                                className="h-10 px-6 font-medium"
                            >
                                <Link href="/projects">إلغاء</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-10 px-8 font-medium"
                            >
                                {processing
                                    ? 'جاري الحفظ...'
                                    : 'حفظ ونشر المشروع'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
