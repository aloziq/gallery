<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoExhibitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'name' => 'نظام إدارة المعارض الذكي',
                'slug' => 'smart-exhibition-system',
                'short_description' => 'منصة متكاملة لإدارة المعارض الجامعية وتقييم المشاريع.',
                'description' => 'يهدف هذا المشروع إلى رقمنة عملية تقييم المشاريع في المعارض الجامعية، مما يتيح للزوار التقييم السريع عبر مسح رموز الاستجابة السريعة (QR Codes) دون الحاجة لتحميل تطبيقات أو تسجيل الدخول.',
                'team_name' => 'فريق الإبداع',
                'department' => 'علوم الحاسب',
                'category' => 'تطبيقات الويب',
                'technologies' => 'Laravel, React, Tailwind CSS',
                'demo_url' => 'https://example.com/smart-exhibition',
            ],
            [
                'name' => 'المستكشف الآلي (روبوت التعرف على التضاريس)',
                'slug' => 'terrain-explorer-robot',
                'short_description' => 'روبوت ذكي قادر على استكشاف التضاريس الصعبة ورسم خرائط ثلاثية الأبعاد.',
                'description' => 'روبوت مزود بكاميرات استشعار العمق وخوارزميات الذكاء الاصطناعي لتجاوز العقبات ورسم خريطة دقيقة للمنطقة المحيطة به، يمكن استخدامه في مهام الإنقاذ.',
                'team_name' => 'روبوتكس',
                'department' => 'هندسة الحاسب',
                'category' => 'الروبوتات',
                'technologies' => 'Python, ROS, C++',
                'demo_url' => null,
            ],
            [
                'name' => 'طبيبك الافتراضي',
                'slug' => 'virtual-doctor',
                'short_description' => 'تطبيق يعتمد على الذكاء الاصطناعي لتشخيص الأمراض الشائعة من خلال الأعراض.',
                'description' => 'يتيح التطبيق للمستخدمين إدخال الأعراض التي يشعرون بها، ويقوم نموذج تعلم الآلة بتحليلها وتقديم تشخيص أولي مع توجيهات للرعاية الذاتية أو ضرورة زيارة الطبيب.',
                'team_name' => 'صناع الصحة',
                'department' => 'نظم المعلومات',
                'category' => 'الذكاء الاصطناعي',
                'technologies' => 'Flutter, TensorFlow, Node.js',
                'demo_url' => 'https://example.com/virtual-doctor',
            ],
            [
                'name' => 'حماية البيانات الموزعة',
                'slug' => 'distributed-data-protection',
                'short_description' => 'نظام لحماية الملفات الحساسة باستخدام تقنيات التشفير الموزع.',
                'description' => 'يهدف المشروع إلى توفير بيئة آمنة لمشاركة الملفات الحساسة داخل المؤسسات من خلال تقسيم الملفات وتشفيرها وتوزيعها على عدة خوادم، مما يمنع الوصول غير المصرح به حتى في حال اختراق أحد الخوادم.',
                'team_name' => 'حراس الأمن السيبراني',
                'department' => 'الأمن السيبراني',
                'category' => 'أمن المعلومات',
                'technologies' => 'Go, cryptography, PostgreSQL',
                'demo_url' => null,
            ],
            [
                'name' => 'منصة التعليم التفاعلي للواقع الافتراضي',
                'slug' => 'vr-interactive-education',
                'short_description' => 'بيئة تعليمية غامرة في الواقع الافتراضي لطلاب المرحلة الثانوية.',
                'description' => 'منصة تتيح للطلاب إجراء التجارب الكيميائية والفيزيائية في بيئة آمنة وتفاعلية باستخدام نظارات الواقع الافتراضي، مما يعزز الفهم والاستيعاب للمفاهيم العلمية.',
                'team_name' => 'رؤية المستقبل',
                'department' => 'تقنية المعلومات',
                'category' => 'الواقع الافتراضي',
                'technologies' => 'Unity, C#, Oculus SDK',
                'demo_url' => 'https://example.com/vr-education',
            ],
            [
                'name' => 'المزرعة الذكية',
                'slug' => 'smart-farm',
                'short_description' => 'نظام إنترنت الأشياء لمراقبة ورعاية المحاصيل الزراعية.',
                'description' => 'نظام متكامل يستخدم مستشعرات رطوبة التربة والحرارة والضوء لجمع البيانات وتحليلها، وبناءً عليها يقوم بري المزروعات تلقائياً وتوفير التنبيهات للمزارع عبر تطبيق الهاتف.',
                'team_name' => 'الحصاد الأخضر',
                'department' => 'هندسة البرمجيات',
                'category' => 'إنترنت الأشياء',
                'technologies' => 'Arduino, ESP32, React Native',
                'demo_url' => null,
            ],
        ];

        foreach ($projects as $index => $projectData) {
            $project = Project::create(array_merge($projectData, [
                'display_order' => $index + 1,
                'is_published' => true,
            ]));

            // Add some members
            $members = [
                ['name' => 'أحمد محمد', 'role' => 'مطور واجهات'],
                ['name' => 'خالد عبدالله', 'role' => 'مطور خلفي'],
                ['name' => 'سارة عبدالرحمن', 'role' => 'مصممة واجهات'],
                ['name' => 'فاطمة علي', 'role' => 'محللة نظم'],
            ];

            // Randomly select 2-3 members for the project
            $selectedMembers = collect($members)->random(rand(2, 3));
            $memberOrder = 1;
            foreach ($selectedMembers as $member) {
                $project->members()->create([
                    'name' => $member['name'],
                    'role' => $member['role'],
                    'display_order' => $memberOrder++,
                ]);
            }
        }

        // Let's create an admin user
        User::factory()->create([
            'name' => 'مدير النظام',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
    }
}
