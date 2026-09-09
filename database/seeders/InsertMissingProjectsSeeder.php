<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InsertMissingProjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $newProjects = [
            [
                'name' => 'أمين الصندوق المالي المحاسبي',
                'slug' => 'amyn-alsndok-almaly-almhasby',
                'short_description' => 'نظام أمين الصندوق المالي المحاسبي المبتكر لإدارة وتتبع المعاملات المالية والمحاسبية.',
                'description' => 'نظام مكتبي متكامل لإدارة الصندوق المالي والعمليات المحاسبية، وتتبع الإيرادات والمصروفات، وإصدار السندات والتقارير المالية الدقيقة.',
                'cover_image' => 'projects/amyn-alsndok-almaly-almhasby/cover.webp',
                'team_name' => 'فريق التميز',
                'department' => 'IT',
                'category' => 'Desktop Application',
                'technologies' => 'Desktop Application, C#, .NET, SQL Server',
                'demo_url' => null,
                'github_url' => null,
                'document_url' => null,
                'academic_level' => '4',
                'gender' => 'male',
                'whatsapp_phone' => null,
                'contact_email' => 'drabdualhadi@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'عبدالهادي خالد عبدالهادي السقاف', 'role' => 'قائد الفريق'],
                ],
            ],
            [
                'name' => 'Hawari Tours',
                'slug' => 'hawari-tours',
                'short_description' => 'Hawari Tours is a complete, professional tourism website for Socotra Island featuring full bilingual support, tour booking, and modern design.',
                'description' => "Hawari Tours is a complete, professional tourism website for Socotra Island, featuring:\n🌐 Bilingual - Full Arabic & English support with RTL/LTR\n🎨 Modern Design - Beautiful UI with Framer Motion animations\n🎛️ Admin Panel - Complete content management system\n🧳 Travel Guide - Comprehensive travel information management\n📸 Gallery - Image, video, and virtual tour management\n✈️ Tours - Tour packages with booking system\n📰 News - Blog/news management system\n🌙 Dark Mode - Full dark mode support\n📱 Responsive - Works perfectly on all devices",
                'cover_image' => null,
                'team_name' => 'Marya',
                'department' => 'Software Engineering',
                'category' => 'Web Development',
                'technologies' => 'Web Development, React, Framer Motion',
                'demo_url' => 'https://www.hawari.tours/',
                'github_url' => 'https://github.com/maryaoaidain/Hawari-Tours.git',
                'document_url' => 'https://drive.google.com/open?id=1SSoOrvfej1UtkaD_dU9Lu4Or1yiCvhbX',
                'academic_level' => '1',
                'gender' => 'female',
                'whatsapp_phone' => '+967 782 302 555',
                'contact_email' => 'maryaoaidain@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'Marya Oaidain', 'role' => 'قائد الفريق'],
                ],
            ],
            [
                'name' => 'QR Code Gift Project',
                'slug' => 'qr-code-gift-project',
                'short_description' => 'نهدف إلى ابتكار أفكار هدايا إبداعية وخارجة عن المألوف، وتحويلها إلى تجربة رقمية مميزة باستخدام رموز QR تلصق على علبة الهدية.',
                'description' => "نهدف إلى ابتكار أفكار هدايا إبداعية وخارجة عن المألوف، وتحويلها إلى تجربة رقمية مميزة باستخدام رموز QR\nيلصق الباركود على علبه الهديه .",
                'cover_image' => null,
                'team_name' => 'Ai outbox',
                'department' => 'Software Engineering',
                'category' => 'Web Development',
                'technologies' => 'Web Development, QR Code',
                'demo_url' => null,
                'github_url' => null,
                'document_url' => null,
                'academic_level' => '3',
                'gender' => 'female',
                'whatsapp_phone' => '+967 782 400 163',
                'contact_email' => 'kbsmt1173@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'بسمة جارالله', 'role' => 'قائد الفريق'],
                ],
            ],
            [
                'name' => 'Robotic hand',
                'slug' => 'robotic-hand',
                'short_description' => 'Robotic Hand is an Arduino-based project designed to simulate the movement of a human hand using servo motors controlled by Arduino Uno.',
                'description' => 'Robotic Hand is an Arduino-based project designed to simulate the movement of a human hand. Servo motors control the fingers, allowing them to open and close based on commands sent through the Arduino Uno. The project demonstrates the basic concepts of robotics, motor control, and human-like motion.',
                'cover_image' => null,
                'team_name' => 'Safia and jawaher',
                'department' => 'IT',
                'category' => 'Internet of Things / Embedded Systems (IoT)',
                'technologies' => 'Arduino, IoT, C++, Servo Motors',
                'demo_url' => null,
                'github_url' => 'https://github.com/safiafares20073/robotic_hand_arduino',
                'document_url' => 'https://drive.google.com/open?id=1ZDfG_2mxQdAqVEBdKS9YW8oVgfhwq0Cw',
                'academic_level' => '2',
                'gender' => 'female',
                'whatsapp_phone' => '+967 782 347 300',
                'contact_email' => 'ayafares20193@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'Safia fares', 'role' => 'قائد الفريق'],
                    ['name' => 'Jawaher alsaqqaf', 'role' => 'عضو فريق'],
                ],
            ],
            [
                'name' => 'MADA – University Student Project Knowledge Platform',
                'slug' => 'mada-university-student-project-knowledge-platform',
                'short_description' => 'MADA is a university student project knowledge platform designed to preserve, organize, and showcase distinguished academic and graduation projects.',
                'description' => 'MADA is a university student project knowledge platform designed to preserve, organize, and showcase distinguished academic and graduation projects. The platform transforms student projects from temporary submissions into a searchable and reusable knowledge repository that future students can learn from and continue developing. Projects are nominated by academic reviewers, documented by their teams, reviewed, and then published on the platform. MADA allows users to explore project descriptions, problems and solutions, team members, technologies, reviews, and the Project Passport, which documents completed features, incomplete parts, source-code availability, and future development opportunities. The system also supports linking new projects to previous projects to preserve the continuity of ideas and contributions across academic years. The current prototype is developed using Oracle Database and Oracle APEX.',
                'cover_image' => null,
                'team_name' => 'Nexora',
                'department' => 'Software Engineering',
                'category' => 'Web Development, Databases/Oracle APEX',
                'technologies' => 'Oracle APEX, Oracle Database, SQL, PL/SQL',
                'demo_url' => null,
                'github_url' => 'https://github.com/SarahAlnobiDev/mada-database-system',
                'document_url' => 'https://drive.google.com/open?id=1w3a-1Z8KhmZ7b1eWXcrNu3eM6nWGuJR5',
                'academic_level' => '3',
                'gender' => 'female',
                'whatsapp_phone' => '+967 771 643 880',
                'contact_email' => 'aljwbytysalh@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'سارة النوبي', 'role' => 'قائد الفريق'],
                    ['name' => 'مروة جميل', 'role' => 'عضو فريق'],
                    ['name' => 'سميرة الطشي', 'role' => 'عضو فريق'],
                ],
            ],
            [
                'name' => 'FurtherHub: Academic Resource Management System',
                'slug' => 'furtherhub-academic-resource-management-system',
                'short_description' => 'FurtherHub is a desktop-based academic resource management and sharing platform designed for university students.',
                'description' => 'FurtherHub is a desktop-based academic resource management and sharing platform designed for university students. It organizes educational resources by major, subject, and resource type, allowing students to quickly access, share, review, and rate academic materials. The current MVP includes student registration and login, subject-based resource browsing, category filtering, direct resource links, ratings and comments, and a rule-based content validation mechanism before publishing resources. The future vision includes direct file uploading and an AI-powered inspection pipeline that analyzes uploaded academic files, extracts content, detects duplicates, classifies resources automatically, evaluates relevance and quality, and either approves them or sends them for review before publication.',
                'cover_image' => null,
                'team_name' => 'FurtherHub Team',
                'department' => 'Software Engineering',
                'category' => 'Desktop Application',
                'technologies' => 'Desktop Application, Python, SQLite',
                'demo_url' => null,
                'github_url' => 'https://github.com/SarahAlnobiDev/furtherhub',
                'document_url' => 'https://drive.google.com/open?id=1W3CTPW8X9lt-RoiaFwTzeU5XREcm4p-8',
                'academic_level' => '3',
                'gender' => 'female',
                'whatsapp_phone' => '+967 771 643 880',
                'contact_email' => 'aljwbytysalh@gmail.com',
                'is_published' => true,
                'members' => [
                    ['name' => 'سارة النوبي', 'role' => 'قائد الفريق'],
                    ['name' => 'Noof Al-Shaibani', 'role' => 'عضو فريق'],
                    ['name' => 'Ghadeer Almisbahi', 'role' => 'عضو فريق'],
                ],
            ],
        ];

        DB::transaction(function () use ($newProjects) {
            $currentMaxOrder = (int) (Project::max('display_order') ?? 0);

            foreach ($newProjects as $data) {
                // Check if already exists by slug
                $existing = Project::where('slug', $data['slug'])->first();

                if ($existing) {
                    continue;
                }

                $members = $data['members'];
                unset($data['members']);

                $currentMaxOrder++;
                $data['display_order'] = $currentMaxOrder;

                /** @var Project $project */
                $project = Project::create($data);

                foreach ($members as $index => $memberData) {
                    $dbMember = Member::firstOrCreate(['name' => trim($memberData['name'])]);

                    $project->members()->attach($dbMember->id, [
                        'role' => $memberData['role'],
                        'display_order' => $index + 1,
                    ]);
                }
            }
        });

        try {
            Cache::forget('projects.index');
            Cache::forget('projects.all');
            Cache::forget('admin.dashboard.stats');
        } catch (\Throwable $e) {
            // Redis or cache store may be offline in local CLI context
        }
    }
}
