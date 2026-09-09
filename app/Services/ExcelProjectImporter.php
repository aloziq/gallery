<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

class ExcelProjectImporter
{
    /**
     * Row indices in projects.xlsx that are superseded by newer re-submissions.
     *
     * @var array<int>
     */
    protected array $supersededRowIndices = [
        6,  // مهامي (superseded by 29)
        8,  // داري (superseded by 15)
        10, // SkillSwap (superseded by 34)
        11, // Cheating Detector (superseded by 13)
        12, // WAINHA (superseded by 14)
        25, // ادارة موظفين (superseded by 26)
        28, // Padel sana'a (superseded by 30)
    ];

    /**
     * Parse and normalize projects from an Excel (.xlsx) file.
     *
     * @param  string  $filePath  Absolute path to the .xlsx file
     * @return array<int, array<string, mixed>>
     */
    public function parse(string $filePath): array
    {
        if (! file_exists($filePath)) {
            throw new RuntimeException("Excel file not found at: {$filePath}");
        }

        $rawRows = $this->readXlsxRows($filePath);
        $dataRows = array_slice($rawRows, 1, null, true);

        $processed = [];
        $usedSlugs = [];

        foreach ($dataRows as $rowNum => $row) {
            if (in_array($rowNum, $this->supersededRowIndices, true)) {
                continue;
            }

            $title = trim($row['C'] ?? '');
            if ($title === '') {
                continue;
            }

            // Fix Row 51 where submitter placed their email into the title column
            if ($rowNum === 51 && str_contains($title, '@')) {
                $title = 'XAl-Hisn - نظام التراسل الفوري المشفر';
            }

            $description = trim($row['D'] ?? '');
            $platform = trim($row['E'] ?? '');
            $category = $this->normalizeCategory($platform);
            $department = $this->normalizeMajor($row['X'] ?? null, $title, $platform);
            $academicLevel = $this->normalizeAcademicLevel($row['J'] ?? null);
            $gender = $this->normalizeGender($row['W'] ?? null);
            $whatsappPhone = $this->formatYemeniPhone($row['V'] ?? null);
            $contactEmail = $this->cleanEmail($row['B'] ?? null);
            $demoUrl = $this->cleanUrl($row['H'] ?? null);
            $githubUrl = $this->cleanUrl($row['I'] ?? null);
            $documentUrl = $this->cleanUrl($row['G'] ?? null);
            $teamName = trim($row['U'] ?? '') ?: null;

            // Merge Dari GitHub URL from initial submission (Row 8)
            if ($rowNum === 15 && empty($githubUrl)) {
                $githubUrl = $this->cleanUrl($dataRows[8]['I'] ?? null);
            }

            $members = $this->extractMembers($row, $rowNum);

            // Generate unique slug
            $baseSlug = Str::slug($title);
            if ($baseSlug === '') {
                $baseSlug = 'project-'.$rowNum;
            }

            $slug = $baseSlug;
            $counter = 2;
            while (isset($usedSlugs[$slug])) {
                $slug = $baseSlug.'-'.$counter;
                $counter++;
            }
            $usedSlugs[$slug] = true;

            $shortDescription = $this->generateShortDescription($description);

            $processed[] = [
                'row_number' => $rowNum,
                'name' => $title,
                'slug' => $slug,
                'short_description' => $shortDescription,
                'description' => $description ?: null,
                'cover_image' => null,
                'team_name' => $teamName,
                'department' => $department,
                'category' => $category,
                'technologies' => $this->inferTechnologies($description, $category),
                'demo_url' => $demoUrl,
                'github_url' => $githubUrl,
                'document_url' => $documentUrl,
                'academic_level' => $academicLevel,
                'gender' => $gender,
                'whatsapp_phone' => $whatsappPhone,
                'contact_email' => $contactEmail,
                'is_published' => true,
                'display_order' => count($processed) + 1,
                'members' => $members,
            ];
        }

        return $processed;
    }

    /**
     * Import parsed projects into the database using a transaction.
     *
     * @return array{created_projects: int, created_members: int}
     */
    public function import(string $filePath): array
    {
        $projectsData = $this->parse($filePath);

        $projectsCount = 0;
        $membersCount = 0;

        DB::transaction(function () use ($projectsData, &$projectsCount, &$membersCount) {
            foreach ($projectsData as $item) {
                $members = $item['members'];
                unset($item['members'], $item['row_number']);

                /** @var Project $project */
                $project = Project::create($item);
                $projectsCount++;

                foreach ($members as $index => $member) {
                    $unifiedName = $this->unifyMemberName($member['name']);
                    $dbMember = Member::firstOrCreate(['name' => $unifiedName]);

                    $project->members()->attach($dbMember->id, [
                        'role' => $member['role'],
                        'display_order' => $index + 1,
                    ]);
                    $membersCount++;
                }
            }
        });

        return [
            'created_projects' => $projectsCount,
            'created_members' => $membersCount,
        ];
    }

    /**
     * Unify spelling variations for team members participating across multiple projects.
     */
    public function unifyMemberName(string $name): string
    {
        $clean = trim(preg_replace('/\s+/u', ' ', $name));

        // 1. Waleed Mohsen Al-Ansi
        if (preg_match('/waleed/i', $clean) && preg_match('/ansi/i', $clean)) {
            return 'Waleed Mohsen Al-Ansi';
        }

        // 2. Bashir Al-Azaki
        if (preg_match('/azaki/i', $clean)) {
            return 'Bashir Al-Azaki';
        }

        // 3. Abduljalil Abdo Saeed
        if (preg_match('/abduljalil/i', $clean)) {
            return 'Abduljalil Abdo Saeed';
        }

        // 4. Mohammed Alshareef
        if (preg_match('/alshareef/i', $clean)) {
            return 'Mohammed Alshareef';
        }

        // 5. Shawqi Ali Naji
        if (str_contains($clean, 'شوقي') && (str_contains($clean, 'ناجي') || str_contains($clean, 'علي'))) {
            return 'شوقي علي ناجي ضيف الله ناصر';
        }

        // 6. Abdulhafiz Dabwan
        if (str_contains($clean, 'دبوان') || preg_match('/dabwan/i', $clean)) {
            return 'عبدالحافظ قيس عبده دبوان';
        }

        // 7. Abdulhadi Al-Saqqaf
        if (preg_match('/saqqaf/i', $clean) || str_contains($clean, 'السقاف')) {
            return 'عبدالهادي خالد عبدالهادي السقاف';
        }

        // 8. Nasher Al-Bshari
        if (str_contains($clean, 'البشاري') && str_contains($clean, 'ناشر')) {
            return 'ناشر مطهر أحمد البشاري';
        }

        return $clean;
    }

    /**
     * Read shared strings and worksheet data using ZipArchive and SimpleXML.
     *
     * @return array<int, array<string, string>>
     */
    protected function readXlsxRows(string $filePath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($filePath) !== true) {
            throw new RuntimeException("Could not open zip archive: {$filePath}");
        }

        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml !== false) {
            $xml = new SimpleXMLElement($stringsXml);
            foreach ($xml->si as $si) {
                if (isset($si->t)) {
                    $sharedStrings[] = (string) $si->t;
                } elseif (isset($si->r)) {
                    $combined = '';
                    foreach ($si->r as $r) {
                        $combined .= (string) $r->t;
                    }
                    $sharedStrings[] = $combined;
                } else {
                    $sharedStrings[] = '';
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml === false) {
            $zip->close();
            throw new RuntimeException('Could not find worksheet sheet1.xml in Excel archive');
        }

        $xml = new SimpleXMLElement($sheetXml);
        $rows = [];

        foreach ($xml->sheetData->row as $row) {
            $rowNum = (int) $row['r'];
            $rowData = [];

            foreach ($row->c as $cell) {
                $cellRef = (string) $cell['r'];
                $colLetter = (string) preg_replace('/[0-9]/', '', $cellRef);
                $type = (string) $cell['t'];
                $val = isset($cell->v) ? (string) $cell->v : '';

                if ($type === 's') {
                    $val = $sharedStrings[(int) $val] ?? '';
                }

                $rowData[$colLetter] = trim($val);
            }

            $rows[$rowNum] = $rowData;
        }

        $zip->close();

        return $rows;
    }

    /**
     * Format Yemeni phone numbers into +967 7xx xxx xxx.
     */
    protected function formatYemeniPhone(?string $raw): ?string
    {
        if (! $raw) {
            return null;
        }

        $num = $raw;
        if (is_numeric($raw)) {
            $num = sprintf('%.0f', (float) $raw);
        }

        $num = preg_replace('/[^0-9]/', '', $num);
        if (! $num) {
            return null;
        }

        if (str_starts_with($num, '967')) {
            $num = substr($num, 3);
        }

        if (str_starts_with($num, '0')) {
            $num = substr($num, 1);
        }

        if (strlen($num) === 9 && str_starts_with($num, '7')) {
            return '+967 '.substr($num, 0, 3).' '.substr($num, 3, 3).' '.substr($num, 6, 3);
        }

        if (strlen($num) === 10 && str_starts_with($num, '7')) {
            return '+967 '.substr($num, 0, 3).' '.substr($num, 3, 3).' '.substr($num, 6);
        }

        return null;
    }

    /**
     * Extract and validate HTTP/HTTPS URLs.
     */
    protected function cleanUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $trimmed = trim($url);

        // Filter out non-URL Arabic and English textual placeholders
        if (preg_match('/^(لا يوجد|لم ارفعه|خاص|المستودع خاص|المشروع قيد التطوير|حاليا local|قريبا|Not available)$/ui', $trimmed)) {
            return null;
        }

        // Handle markdown formatted links: [text](http://...)
        if (preg_match('/\[(https?:\/\/[^\]]+)\]/', $trimmed, $matches)) {
            $trimmed = $matches[1];
        }

        // Extract URL pattern
        if (preg_match('/(https?:\/\/[^\s\)\>]+)/', $trimmed, $matches)) {
            $trimmed = $matches[1];
        }

        $trimmed = rtrim($trimmed, ').,');

        if (filter_var($trimmed, FILTER_VALIDATE_URL)) {
            return $trimmed;
        }

        return null;
    }

    /**
     * Clean email address.
     */
    protected function cleanEmail(?string $email): ?string
    {
        if (! $email) {
            return null;
        }

        $trimmed = trim($email);

        return filter_var($trimmed, FILTER_VALIDATE_EMAIL) ? $trimmed : null;
    }

    /**
     * Normalize academic level to string representation '1', '2', '3', or '4'.
     */
    protected function normalizeAcademicLevel(?string $val): ?string
    {
        if (! $val) {
            return null;
        }

        if (preg_match('/1(\.0)?/i', $val) || stripos($val, 'freshman') !== false) {
            return '1';
        }

        if (preg_match('/2(\.0)?/i', $val) || stripos($val, 'sophomore') !== false) {
            return '2';
        }

        if (preg_match('/3(\.0)?/i', $val) || stripos($val, 'junior') !== false) {
            return '3';
        }

        if (preg_match('/4(\.0)?/i', $val) || stripos($val, 'senior') !== false) {
            return '4';
        }

        return null;
    }

    /**
     * Normalize student gender to lowercase 'male' or 'female'.
     */
    protected function normalizeGender(?string $val): ?string
    {
        if (! $val) {
            return null;
        }

        $lower = strtolower(trim($val));

        if ($lower === 'male' || str_contains($lower, 'بنين') || str_contains($lower, 'طلاب')) {
            return 'male';
        }

        if ($lower === 'female' || str_contains($lower, 'بنات') || str_contains($lower, 'طالبات')) {
            return 'female';
        }

        return $lower ?: null;
    }

    /**
     * Normalize student major / department.
     */
    protected function normalizeMajor(?string $val, string $title, string $platform): ?string
    {
        $trimmed = trim($val ?? '');

        if ($trimmed === 'IT (ar/en)') {
            return 'IT';
        }

        if (in_array($trimmed, ['BIT', 'IT', 'Software Engineering', 'Information Systems', 'Cyber Security'], true)) {
            return $trimmed;
        }

        // Infer Cyber Security for exploitation / RAT project
        if ($platform === 'Rat' || stripos($title, 'إختراق') !== false) {
            return 'Cyber Security';
        }

        return $trimmed !== '' ? $trimmed : null;
    }

    /**
     * Normalize platform / category.
     */
    protected function normalizeCategory(?string $platform): string
    {
        $trimmed = trim($platform ?? '');

        if ($trimmed === 'Rat' || $trimmed === 'Python') {
            return 'Desktop Application';
        }

        if ($trimmed === 'مشروع تخرج') {
            return 'Web Development';
        }

        if (str_contains($trimmed, 'Visual studio')) {
            return 'Web Development, VS Code Extension';
        }

        return $trimmed !== '' ? $trimmed : 'Web Development';
    }

    /**
     * Extract and clean team members from columns K, M, O, Q, S.
     *
     * @param  array<string, string>  $row
     * @return array<int, array{name: string, role: ?string}>
     */
    protected function extractMembers(array $row, int $rowNum): array
    {
        $members = [];
        $rawM1 = trim($row['K'] ?? '');

        if ($rowNum === 2) {
            // Row 2 Member 1 has '3.0'; skip it as actual members are in M, O, Q
        } elseif ($rowNum === 4 || $rowNum === 5) {
            // Submitter did the project individually
            $members[] = [
                'name' => 'عبدالحافظ قيس عبده دبوان',
                'role' => 'مطور',
            ];
        } elseif ($rowNum === 26) {
            // Row 26 has comma-separated list of 5 students in Member 1
            $names = preg_split('/[،,]/u', $rawM1);
            if ($names) {
                foreach ($names as $idx => $n) {
                    $cleanName = trim($n);
                    if ($cleanName !== '') {
                        $members[] = [
                            'name' => $cleanName,
                            'role' => $idx === 0 ? 'قائد الفريق' : 'عضو فريق',
                        ];
                    }
                }
            }
        } elseif ($rowNum === 42) {
            $members[] = [
                'name' => 'فريد ماجد محمد المخلافي',
                'role' => 'صاحب الفكرة',
            ];
        } else {
            if ($rawM1 !== '' && ! is_numeric($rawM1)) {
                $parsed = $this->parseNameAndRole($rawM1, 'قائد الفريق');
                $members[] = $parsed;
            }
        }

        // Additional members in columns M, O, Q, S
        $additionalCols = ['M', 'O', 'Q', 'S'];
        foreach ($additionalCols as $col) {
            $rawMember = trim($row[$col] ?? '');
            if ($rawMember !== '' && ! is_numeric($rawMember)) {
                $members[] = $this->parseNameAndRole($rawMember, 'عضو فريق');
            }
        }

        return $members;
    }

    /**
     * Parse member name and optional embedded role.
     *
     * @return array{name: string, role: ?string}
     */
    protected function parseNameAndRole(string $raw, string $defaultRole): array
    {
        if (preg_match('/^([^"\(]+)["\(]([^"\)]+)["\)]/u', $raw, $matches)) {
            $name = trim($matches[1]);
            $role = trim($matches[2]);

            return [
                'name' => $name,
                'role' => $role ?: $defaultRole,
            ];
        }

        return [
            'name' => $raw,
            'role' => $defaultRole,
        ];
    }

    /**
     * Generate a concise short description suitable for cards.
     */
    protected function generateShortDescription(string $description): ?string
    {
        if ($description === '') {
            return null;
        }

        $clean = trim((string) preg_replace('/\s+/', ' ', strip_tags($description)));

        // Try extracting first sentence ending in period or Arabic question mark
        if (preg_match('/^([^\.\!\؟\n]+[\.\!\؟])/u', $clean, $matches)) {
            $sentence = trim($matches[1]);
            if (mb_strlen($sentence) >= 30 && mb_strlen($sentence) <= 220) {
                return $sentence;
            }
        }

        if (mb_strlen($clean) <= 190) {
            return $clean;
        }

        return mb_substr($clean, 0, 190).'...';
    }

    /**
     * Infer technologies list from description and category.
     */
    protected function inferTechnologies(string $description, string $category): ?string
    {
        $techs = [];
        $lowerDesc = mb_strtolower($description);

        $knownMap = [
            'react' => 'React',
            'flutter' => 'Flutter',
            'laravel' => 'Laravel',
            'php' => 'PHP',
            'mysql' => 'MySQL',
            'python' => 'Python',
            'tensorflow' => 'TensorFlow',
            'node' => 'Node.js',
            'vue' => 'Vue.js',
            'tailwind' => 'Tailwind CSS',
            'sqlite' => 'SQLite',
            'postgresql' => 'PostgreSQL',
            'c++' => 'C++',
            'c#' => 'C#',
            '.net' => '.NET',
            'docker' => 'Docker',
            'aws' => 'AWS',
            'firebase' => 'Firebase',
            'arduino' => 'Arduino',
            'raspberry' => 'Raspberry Pi',
        ];

        foreach ($knownMap as $key => $label) {
            if (str_contains($lowerDesc, $key)) {
                $techs[] = $label;
            }
        }

        if (! empty($techs)) {
            return implode(', ', array_unique($techs));
        }

        return $category;
    }
}
