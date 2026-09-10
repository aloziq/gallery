<?php

namespace App\Console\Commands;

use App\Models\Project;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class GenerateProjectQrsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:generate-qr
                            {--host= : The base host URL for project links (defaults to APP_URL or https://gallery.srv1428362.hstgr.cloud)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate minimal, print-ready SVGs with 5-word title and QR code (no phone number), and save them in the database';

    /**
     * Dictionary of precise 5-word titles mapped by project slug.
     *
     * @var array<string, string>
     */
    protected array $fiveWordTitles = [
        'golden-vehicle-car-rental-and-sales-management-system' => 'نظام إدارة وتأجير السيارات الذكي',
        'presentrak' => 'نظام PresenTrak لتتبع الحضور الذكي',
        'ntham-adar-mothfyn' => 'نظام إدارة الموظفين والموارد البشرية',
        'ttbyk-adar-mkhazn-mtkaml' => 'تطبيق متكامل لإدارة المخازن والمستودعات',
        'mns-mlath' => 'منصة ملاذ للخدمات الطلابية الذكية',
        'ntham-altnbo-balmoafk-aal-alkrod' => 'نظام التنبؤ بالموافقة على القروض',
        'cheating-detector-similarity-graph-analysis-system' => 'نظام كشف الانتحال وتحليل التشابه',
        'wainha-yemeni-lost-found-platform' => 'منصة وينها للمفقودات اليمنية الذكية',
        'dary-ntham-adar-almbany-alskny-oalaakarat' => 'نظام داري لإدارة المباني والعقارات',
        'mns-thkaaa' => 'منصة ذكاء لحلول الذكاء الاصطناعي',
        'ttbyk-rfyky-alakadymy' => 'تطبيق رفيقي الأكاديمي للخدمات الجامعية',
        'aakarat' => 'تطبيق إيواء للخدمات العقارية المتكاملة',
        'radar-almror-lkshf-mkhalf-sraa-alsyarat-rasd' => 'نظام راصد لكشف مخالفات السرعة',
        'rat-akhtrak' => 'منظومة الأمان المتقدم لاختبار الاختراق',
        'ntham-almhadrat-o-altkalyf' => 'نظام إدارة المحاضرات والتكاليف الجامعية',
        'mns-oyb-mtkaml-lkhdmat-aayad-alnsaaa-oalolad-oadar-tlbat-almoaaayd' => 'منصة عيادة النساء وحجز المواعيد',
        'almsaaad-althky-lltlab' => 'المساعد الذكي لدعم الطلاب الجامعيين',
        'flowers' => 'متجر ورد الإلكتروني لبيع الزهور',
        'employee-management' => 'نظام إدارة الموظفين وتوزيع المهام',
        'apex' => 'منصة APEX الذكية لإدارة المهام',
        'ttbyk-mhamy' => 'تطبيق مهامي لإدارة المهام اليومية',
        'adar-andy-padel' => 'نظام إدارة وتشغيل أندية البادل',
        'mrkz-alroy-altby' => 'نظام مركز الرؤية الطبي المتكامل',
        'mydany-mydany' => 'نظام ميداني لإدارة التدريب الميداني',
        'smartkids-arvr' => 'منصة SmartKids للتعليم التفاعلي الذكي',
        'skillswap' => 'منصة SkillSwap لتبادل المهارات والخبرات',
        'aldlyl-altgary-alsnaaay-alymny' => 'الدليل التجاري والصناعي اليمني الشامل',
        'cyberlab' => 'منصة CyberLab المتقدمة للأمن السيبراني',
        'cybervault' => 'نظام Cybervault لحماية وتشفير البيانات',
        'expensetracker' => 'تطبيق ExpenseTracker لتتبع النفقات والميزانية',
        'myon-mobayl' => 'تطبيق ميون موبايل لخدمات الاتصالات',
        'ntham-thky-llsyan-altnboy-lmoldat-aldyzl' => 'نظام الصيانة التنبؤية لمولدات الديزل',
        'ntham-adar-mstshf' => 'نظام إدارة المستشفيات والسجلات الطبية',
        'uni-medical-sphere' => 'منصة Uni Medical Sphere الطبية',
        'studentms' => 'نظام StudentMS لإدارة شؤون الطلاب',
        'banking-app' => 'تطبيق الخدمات المصرفية والبنكية الذكية',
        'hotel' => 'نظام إدارة الفنادق والحجوزات الفندقية',
        'ai-dermatologist-ai-system-for-skin-disease-diagnosis' => 'نظام الذكاء الاصطناعي لتشخيص الجلد',
        'careerai-graduate-employability-career-decision-support' => 'منصة CareerAI لدعم التوجيه المهني',
        'ntham-adar-nkat-albyaa-oalmbyaaat-synq-pos' => 'نظام SYNQ POS لنقاط البيع',
        'ntham-erp-ntham-mndobyn' => 'نظام ERP متكامل لإدارة المندوبين',
        'mns-maard-thky-ltgrb-tfaaaly-otkyym-fory-lmsharyaa-altlab-almbtkr' => 'منصة معرض ذكية لمشاريع الطلاب',
        'xal-hisn-ntham-altrasl-alfory-almshfr' => 'نظام الحصن للتراسل الفوري المشفر',
        'amyn-alsndok-almaly-almhasby' => 'أمين الصندوق المالي المحاسبي المبتكر',
        'hawari-tours' => 'موقع حواري تورز السياحي المتكامل',
        'qr-code-gift-project' => 'مشروع هدايا الباركود والرموز التفاعلية',
        'robotic-hand' => 'مشروع اليد الروبوتية الذكية أردوينو',
        'mada-university-student-project-knowledge-platform' => 'منصة مدى لمشاريع الطلاب الجامعية',
        'furtherhub-academic-resource-management-system' => 'منصة FurtherHub لإدارة الموارد الأكاديمية',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $baseHost = rtrim(
            $this->option('host')
            ?: 'https://gallery.srv1428362.hstgr.cloud',
            '/'
        );
        $projects = Project::all();

        $this->info("Generating print-ready SVGs for {$projects->count()} projects using base host: {$baseHost}...");

        $renderer = new ImageRenderer(
            new RendererStyle(400, 0),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);

        $bar = $this->output->createProgressBar($projects->count());
        $bar->start();

        foreach ($projects as $project) {
            $slug = $project->slug;
            $url = "{$baseHost}/p/{$slug}";

            // 1. Generate core vector QR SVG
            $rawQrSvg = $writer->writeString($url);

            // Extract inner svg elements
            $qrInner = preg_replace('/^.*?<svg[^>]*>/s', '', $rawQrSvg);
            $qrInner = preg_replace('/<\/svg>$/s', '', $qrInner);

            // 2. Determine 5-word title
            $fiveWordTitle = $this->fiveWordTitles[$slug] ?? $this->extractFiveWordFallback($project->name);

            // 3. Assemble clean print-ready SVG (no phone number)
            $fullSvg = $this->buildPrintReadySvg(
                title: $fiveWordTitle,
                qrInner: $qrInner
            );

            // 4. Save files to storage
            $projectDir = storage_path("app/public/projects/{$slug}");
            File::makeDirectory($projectDir, 0755, true, true);

            File::put("{$projectDir}/qr-card.svg", $fullSvg);
            File::put("{$projectDir}/qr-code.svg", $rawQrSvg);

            // 5. Update database record
            $project->update([
                'qr_code' => "projects/{$slug}/qr-card.svg",
                'qr_svg' => $fullSvg,
            ]);

            try {
                Cache::forget("project.show.{$slug}");
            } catch (\Throwable $e) {
                // Ignore cache exception if cache store is offline
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        try {
            Cache::forget('projects.index');
        } catch (\Throwable $e) {
            // Ignore cache exception if cache store is offline
        }

        $this->info('Successfully generated and saved print-ready SVGs for all projects in the database!');

        return self::SUCCESS;
    }

    /**
     * Fallback to create a 5-word title if not explicitly in dictionary.
     */
    protected function extractFiveWordFallback(string $name): string
    {
        $words = preg_split('/\s+/u', trim($name), -1, PREG_SPLIT_NO_EMPTY);
        if (count($words) >= 5) {
            return implode(' ', array_slice($words, 0, 5));
        }

        while (count($words) < 5) {
            $words[] = 'المبتكر';
        }

        return implode(' ', $words);
    }

    /**
     * Build the minimal, print-ready SVG containing only the 5-word title and QR code (no phone number).
     */
    protected function buildPrintReadySvg(
        string $title,
        string $qrInner
    ): string {
        $cleanTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 620" width="600" height="620" dir="rtl">
  <!-- Solid White Background for sharp, high-contrast printing -->
  <rect width="100%" height="100%" fill="#ffffff" />

  <!-- 1. 5-Word Project Title -->
  <text x="300" y="80" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="bold" fill="#000000">{$cleanTitle}</text>

  <!-- 2. QR Code (400x400 centered, no phone number) -->
  <g transform="translate(100, 130)">
    {$qrInner}
  </g>
</svg>
SVG;
    }
}
