import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <div dir="rtl" className="font-sans">
            <Head title="تسجيل الدخول — لوحة الإدارة" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-1.5 text-right">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-medium text-foreground"
                                >
                                    البريد الإلكتروني
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                    dir="ltr"
                                    className="rounded font-mono text-xs"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5 text-right">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-medium text-foreground"
                                    >
                                        كلمة المرور
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                            tabIndex={5}
                                        >
                                            نسيت كلمة المرور؟
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    dir="ltr"
                                    className="rounded font-mono text-xs"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-xs text-muted-foreground"
                                >
                                    تذكر تسجيل الدخول
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-10 w-full rounded text-xs font-semibold"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                تسجيل الدخول
                            </Button>
                        </div>

                        <div className="pt-2 text-center text-xs text-muted-foreground">
                            ليس لديك حساب؟{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-foreground underline underline-offset-4"
                            >
                                تسجيل حساب جديد
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-xs font-medium text-green-600">
                    {status}
                </div>
            )}
        </div>
    );
}

Login.layout = {
    title: 'لوحة إدارة المعرض',
    description:
        'أدخل بيانات الاعتماد للوصول إلى لوحة التحكم والإحصائيات الحية',
};
