<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Support\Facades\File;
use RuntimeException;
use ZipArchive;

class MediaSyncService
{
    /**
     * Map of project media links and IDs from projects.xlsx.
     *
     * @var array<string, array<string, mixed>>
     */
    protected array $mediaCatalog = [];

    /**
     * Known alias dictionary for Google Account submitter names.
     *
     * @var array<string, string>
     */
    protected array $accountAliases = [
        'kalayid4z' => 'aldysm116@gmail.com',
        '# Aya' => 'alqubatiaya@gmail.com',
        'Kasper Key' => 'kasperkey106@gmail.com',
        'kasperkey106@gmail.com' => 'kasperkey106@gmail.com',
        'JANNAT' => 'janhas1233@gmail.com',
        'Abdu Alhadi' => 'abduhadialsaqqaf@gmail.com',
        'Alaa Abuhadi' => 'abuhadialaa@gmail.com',
        'Shima Ebrahim' => 'enanamr123@gmail.com',
        'Moath Ali' => 'moathali442@gmail.com',
        'أحمد علمدار' => 'alselwiahmed990@gmail.com',
        'عبدالله بن محمد' => 'abdullahw8080@gmail.com',
        'اسلام العصري' => 'eslam.h.alasri@gmail.com',
        'Azad Haider' => 'azadhaider62@gmail.com',
        'Malak Thaypan' => 'malakthaypan7280@gmail.com',
        'Fareed Majied' => 'fareedmajied@gmail.com',
        'Ghufran Ghamdhan' => 'ghamdhanghufran@gmail.com',
        'مهند الحزمي' => 'alhzmi01@gmail.com',
        'رويدا ابراهيم' => 'rwydaa785@gmail.com',
        'Mohammed Aloziq' => 'mohammadaloziq8@gmail.com',
        'فيصل مبخوت سعيد باعوض' => 'faisalmabkhotwww2@gmail.com',
        'ايمن الحماطي' => 'c774753135@gmail.com',
        'Nada ALahmar' => 'nadaalahmar4@gmail.com',
        'Mohammed Alyhiwi' => 'ebnalyhiwi59@gmail.com',
    ];

    /**
     * Build the catalog of expected media from projects.xlsx.
     *
     * @return array<string, array<string, mixed>>
     */
    public function buildMediaCatalog(?string $excelPath = null): array
    {
        $filePath = $excelPath ?: base_path('projects.xlsx');

        if (! file_exists($filePath)) {
            throw new RuntimeException("Excel file not found at: {$filePath}");
        }

        $importer = new ExcelProjectImporter;
        $parsedProjects = $importer->parse($filePath);

        $rawRows = $this->readXlsxRawRows($filePath);
        $catalog = [];

        foreach ($parsedProjects as $item) {
            $rowNum = $item['row_number'];
            $slug = $item['slug'];
            $rawRow = $rawRows[$rowNum] ?? [];

            $dbProject = Project::where('slug', $slug)->first();

            $screenshotUrl = $this->cleanDriveUrl($rawRow['F'] ?? null);
            $documentUrl = $this->cleanDriveUrl($rawRow['G'] ?? null);

            $memberPhotos = [];
            $memberCols = ['L', 'N', 'P', 'R', 'T'];
            if ($dbProject) {
                $dbMembers = $dbProject->members()->orderBy('project_members.display_order')->get();
                foreach ($memberCols as $idx => $col) {
                    $url = $this->cleanDriveUrl($rawRow[$col] ?? null);
                    if ($url && isset($dbMembers[$idx])) {
                        $memberPhotos[] = [
                            'member_id' => $dbMembers[$idx]->id,
                            'member_name' => $dbMembers[$idx]->name,
                            'url' => $url,
                            'file_id' => $this->extractDriveFileId($url),
                            'order' => $idx + 1,
                        ];
                    }
                }
            }

            $email = strtolower(trim($rawRow['B'] ?? ''));

            $catalog[$slug] = [
                'row_number' => $rowNum,
                'project_id' => $dbProject?->id,
                'name' => $item['name'],
                'slug' => $slug,
                'department' => $item['department'],
                'category' => $item['category'],
                'team_name' => $item['team_name'],
                'email' => $email,
                'email_prefix' => explode('@', $email)[0],
                'screenshot_url' => $screenshotUrl,
                'screenshot_file_id' => $this->extractDriveFileId($screenshotUrl),
                'document_url' => $documentUrl,
                'document_file_id' => $this->extractDriveFileId($documentUrl),
                'member_photos' => $memberPhotos,
            ];
        }

        $this->mediaCatalog = $catalog;

        return $catalog;
    }

    /**
     * Remove incorrect or outdated media files and reset media fields.
     */
    public function resetMediaStorage(): void
    {
        $projectsDir = storage_path('app/public/projects');
        $membersDir = storage_path('app/public/members');

        if (File::isDirectory($projectsDir)) {
            File::deleteDirectory($projectsDir);
        }
        if (File::isDirectory($membersDir)) {
            File::deleteDirectory($membersDir);
        }

        File::makeDirectory($projectsDir, 0755, true, true);
        File::makeDirectory($membersDir, 0755, true, true);

        Project::query()->update([
            'cover_image' => null,
            'document_url' => null,
        ]);

        Member::query()->update([
            'photo' => null,
        ]);

        ProjectMember::query()->update([
            'photo' => null,
        ]);
    }

    /**
     * Ingest media files from a local folder or extracted archive.
     *
     * @param  string  $sourcePath  Path to folder or .zip file
     * @return array{screenshots: int, documents: int, member_photos: int}
     */
    public function ingestFromSource(string $sourcePath): array
    {
        $this->resetMediaStorage();

        if (empty($this->mediaCatalog)) {
            $this->buildMediaCatalog();
        }

        $tempExtractDir = null;
        $scanDir = $sourcePath;

        if (is_file($sourcePath) && str_ends_with(strtolower($sourcePath), '.zip')) {
            $tempExtractDir = storage_path('app/temp_media_extract_'.time());
            File::makeDirectory($tempExtractDir, 0755, true, true);

            $zip = new ZipArchive;
            if ($zip->open($sourcePath) === true) {
                $zip->extractTo($tempExtractDir);
                $zip->close();
                $scanDir = $tempExtractDir;
            } else {
                throw new RuntimeException("Failed to unzip source file: {$sourcePath}");
            }
        }

        if (! is_dir($scanDir)) {
            throw new RuntimeException("Directory not found: {$scanDir}");
        }

        $allFiles = File::allFiles($scanDir);
        $counts = [
            'screenshots' => 0,
            'documents' => 0,
            'member_photos' => 0,
        ];

        // Group projects by slug and row number for quick lookup
        $projectsBySlug = [];
        $projectsByRow = [];
        foreach ($this->mediaCatalog as $slug => $info) {
            $projectsBySlug[$slug] = $info;
            $projectsByRow[$info['row_number']] = $info;
        }

        foreach ($allFiles as $file) {
            $filename = $file->getFilename();
            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $parts = explode('/', $relativePath);
            $folder = $parts[0] === 'Untitled form (File responses)' ? ($parts[1] ?? '') : $parts[0];

            // Parse file base name and submitter name
            $fileBase = $filename;
            $submitter = '';
            if (preg_match('/^(.*) - (.*?)\.([a-zA-Z0-9]+)$/u', $filename, $m)) {
                $fileBase = trim($m[1]);
                $submitter = trim($m[2]);
            }
            $cleanSubmitter = preg_replace('/\s*\(\d+\)$/', '', $submitter);
            $cleanSubmitterLower = mb_strtolower($cleanSubmitter);
            $baseLower = mb_strtolower($fileBase);

            // Determine media type
            $isScreenshot = str_contains($folder, 'واجهة المشروع');
            $isDocument = str_contains($folder, 'توثيق المشروع');
            $memberOrder = null;

            if (str_contains($folder, 'Team Member 1')) {
                $memberOrder = 1;
            } elseif (str_contains($folder, 'Team Member 2')) {
                $memberOrder = 2;
            } elseif (str_contains($folder, 'Team Member 3')) {
                $memberOrder = 3;
            } elseif (str_contains($folder, 'Team Member 4')) {
                $memberOrder = 4;
            } elseif (str_contains($folder, 'Team Member 5')) {
                $memberOrder = 5;
            }

            // Find matching project
            $targetProjectInfo = $this->resolveProjectForFile(
                $cleanSubmitter,
                $cleanSubmitterLower,
                $baseLower,
                $filename,
                $projectsBySlug,
                $projectsByRow
            );

            if (! $targetProjectInfo) {
                continue;
            }

            $slug = $targetProjectInfo['slug'];
            $project = Project::where('slug', $slug)->first();
            if (! $project) {
                continue;
            }

            $projectDir = storage_path("app/public/projects/{$slug}");
            File::makeDirectory($projectDir, 0755, true, true);

            // 1. Process Screenshot / Cover
            if ($isScreenshot) {
                $ext = $this->optimizeAndSaveImage($file->getRealPath(), "{$projectDir}/cover", 1280, 82);
                $project->update(['cover_image' => "projects/{$slug}/cover.{$ext}"]);
                $counts['screenshots']++;
            }
            // 2. Process Document
            elseif ($isDocument) {
                $docExt = strtolower($file->getExtension()) ?: 'docx';
                $destPath = "{$projectDir}/document.{$docExt}";
                File::copy($file->getRealPath(), $destPath);
                $project->update(['document_url' => "/storage/projects/{$slug}/document.{$docExt}"]);
                $counts['documents']++;
            }
            // 3. Process Member Portrait
            elseif ($memberOrder !== null) {
                $members = $project->members()->orderBy('project_members.display_order')->get();
                $memberIndex = $memberOrder - 1;
                $targetMember = $members[$memberIndex] ?? null;

                if ($targetMember) {
                    $membersDir = storage_path('app/public/members');
                    File::makeDirectory($membersDir, 0755, true, true);

                    $ext = $this->optimizeAndSaveImage($file->getRealPath(), "{$membersDir}/{$targetMember->id}", 400, 85);
                    $photoPath = "members/{$targetMember->id}.{$ext}";

                    Member::where('id', $targetMember->id)->update(['photo' => $photoPath]);
                    ProjectMember::where('project_id', $project->id)
                        ->where('member_id', $targetMember->id)
                        ->update(['photo' => $photoPath]);

                    $counts['member_photos']++;
                }
            }
        }

        // Clean up temp extraction directory
        if ($tempExtractDir && File::isDirectory($tempExtractDir)) {
            File::deleteDirectory($tempExtractDir);
        }

        return $counts;
    }

    /**
     * Resolve the exact project matching a file based on submitter, filename, and aliases.
     *
     * @param  array<string, array<string, mixed>>  $projectsBySlug
     * @param  array<int, array<string, mixed>>  $projectsByRow
     * @return array<string, mixed>|null
     */
    protected function resolveProjectForFile(
        string $cleanSubmitter,
        string $cleanSubmitterLower,
        string $baseLower,
        string $filename,
        array $projectsBySlug,
        array $projectsByRow
    ): ?array {
        // Special Cases
        // 1. عبدالحافظ قيس (abo711621617@gmail.com)
        if (str_contains($cleanSubmitter, 'عبدالحافظ قيس')) {
            if (str_contains($filename, 'iaalah') || str_contains($filename, 'موظفين')) {
                return $projectsByRow[4] ?? null; // نظام ادارة موظفين
            }

            return $projectsByRow[5] ?? null; // تطبيق ادارة مخازن متكامل
        }

        // 2. Waleed Al-Ansi
        if ($cleanSubmitterLower === 'waleed al-ansi' || $cleanSubmitterLower === 'waleed alansi') {
            if (str_contains($baseLower, 'داري') || str_contains($baseLower, 'dari') || str_contains($baseLower, 'عقارات') || str_contains($baseLower, 'المباني')) {
                return $projectsByRow[15] ?? null; // داري
            }
            if (str_contains($baseLower, 'ديزل') || str_contains($baseLower, 'مولدات') || str_contains($baseLower, 'spmsdg')) {
                return $projectsByRow[40] ?? null; // مولدات ديزل
            }
            if (str_contains($baseLower, 'قروض') || str_contains($baseLower, 'بنوك') || str_contains($baseLower, 'صوره توضح النظام')) {
                return $projectsByRow[9] ?? null; // قروض
            }

            return $projectsByRow[15] ?? $projectsByRow[9] ?? null;
        }

        // 3. ناشر البشاري
        if (str_contains($cleanSubmitter, 'البشاري')) {
            if (str_contains($baseLower, 'مهامي') || str_contains($filename, '٢٠٢٦٠٨٣١')) {
                return $projectsByRow[29] ?? null; // تطبيق مهامي
            }

            return $projectsByRow[18] ?? null; // عقارات
        }

        // 4. شوقي الميدمة
        if (str_contains($cleanSubmitter, 'شوقي الميدمه') || str_contains($cleanSubmitter, 'شوقي الميدمة')) {
            if (str_contains($filename, 'IMG-20260125-WA0003')) {
                return $projectsByRow[13] ?? null; // Cheating Detector
            }

            return $projectsByRow[14] ?? null; // WAINHA
        }

        // 5. Mohammed Alshareef
        if ($cleanSubmitterLower === 'mohammed alshareef') {
            return $projectsByRow[30] ?? null; // ادارة اندية padel
        }

        // 6. Alaa Mohameed
        if (str_contains($cleanSubmitterLower, 'alaa mohameed')) {
            return $projectsByRow[34] ?? null; // SkillSwap
        }

        // 7. Abdu Alhadi
        if ($cleanSubmitterLower === 'abdu alhadi') {
            return $projectsByRow[51] ?? $projectsByRow[47] ?? null; // XAl-Hisn / CareerAI
        }

        // 8. Kasper Key
        if ($cleanSubmitterLower === 'kasper key') {
            return $projectsByRow[16] ?? null; // منصة ذكاء
        }

        // 9. Match via alias dictionary
        if (isset($this->accountAliases[$cleanSubmitter])) {
            $email = $this->accountAliases[$cleanSubmitter];
            foreach ($projectsBySlug as $p) {
                if ($p['email'] === $email) {
                    return $p;
                }
            }
        }

        // 10. General search by email prefix or member name
        foreach ($projectsBySlug as $p) {
            if ($p['email_prefix'] === $cleanSubmitterLower) {
                return $p;
            }
            if (str_contains($cleanSubmitterLower, $p['email_prefix'])) {
                return $p;
            }
            $pModel = Project::where('slug', $p['slug'])->first();
            if ($pModel) {
                foreach ($pModel->members as $m) {
                    if (mb_stripos($m->name, $cleanSubmitter) !== false || mb_stripos($cleanSubmitter, $m->name) !== false) {
                        return $p;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Attempt to download files directly from Google Drive (if shared as public).
     *
     * @return array{screenshots: int, documents: int, member_photos: int}
     */
    public function downloadDirect(): array
    {
        if (empty($this->mediaCatalog)) {
            $this->buildMediaCatalog();
        }

        $counts = [
            'screenshots' => 0,
            'documents' => 0,
            'member_photos' => 0,
        ];

        foreach ($this->mediaCatalog as $slug => $info) {
            $project = Project::where('slug', $slug)->first();
            if (! $project) {
                continue;
            }

            $projectDir = storage_path("app/public/projects/{$slug}");
            File::makeDirectory($projectDir, 0755, true, true);

            // Screenshot
            if ($info['screenshot_file_id']) {
                $data = $this->fetchGoogleDriveFile($info['screenshot_file_id']);
                if ($data && ! empty($data['content'])) {
                    $tempRaw = tempnam(sys_get_temp_dir(), 'img_');
                    File::put($tempRaw, $data['content']);
                    $ext = $this->optimizeAndSaveImage($tempRaw, "{$projectDir}/cover", 1280, 82);
                    @unlink($tempRaw);
                    $project->update(['cover_image' => "projects/{$slug}/cover.{$ext}"]);
                    $counts['screenshots']++;
                }
            }

            // Document
            if ($info['document_file_id']) {
                $data = $this->fetchGoogleDriveFile($info['document_file_id']);
                if ($data && ! empty($data['content'])) {
                    $ext = $this->mimeToExtension($data['mime']) ?: 'pdf';
                    $destPath = "{$projectDir}/document.{$ext}";
                    File::put($destPath, $data['content']);
                    $project->update(['document_url' => "/storage/projects/{$slug}/document.{$ext}"]);
                    $counts['documents']++;
                }
            }

            // Member Photos
            foreach ($info['member_photos'] as $mPhoto) {
                if ($mPhoto['file_id']) {
                    $data = $this->fetchGoogleDriveFile($mPhoto['file_id']);
                    if ($data && ! empty($data['content'])) {
                        $membersDir = storage_path('app/public/members');
                        File::makeDirectory($membersDir, 0755, true, true);

                        $tempRaw = tempnam(sys_get_temp_dir(), 'mbr_');
                        File::put($tempRaw, $data['content']);
                        $ext = $this->optimizeAndSaveImage($tempRaw, "{$membersDir}/{$mPhoto['member_id']}", 400, 85);
                        @unlink($tempRaw);
                        Member::where('id', $mPhoto['member_id'])->update([
                            'photo' => "members/{$mPhoto['member_id']}.{$ext}",
                        ]);
                        ProjectMember::where('project_id', $project->id)
                            ->where('member_id', $mPhoto['member_id'])
                            ->update([
                                'photo' => "members/{$mPhoto['member_id']}.{$ext}",
                            ]);
                        $counts['member_photos']++;
                    }
                }
            }
        }

        return $counts;
    }

    /**
     * Generate branded SVG cover banners for projects that do not have a cover image.
     *
     * @return int Number of fallback covers generated
     */
    public function generateFallbackCovers(): int
    {
        $projects = Project::whereNull('cover_image')
            ->orWhere('cover_image', '')
            ->get();

        $generated = 0;

        foreach ($projects as $project) {
            $projectDir = storage_path("app/public/projects/{$project->slug}");
            File::makeDirectory($projectDir, 0755, true, true);

            $svgContent = $this->createProjectCoverSvg(
                $project->name,
                $project->department ?: $project->category ?: 'مشروع جامعي',
                $project->team_name ?: ($project->category ?: 'معرض المشاريع 2026')
            );

            $svgPath = "{$projectDir}/cover.svg";
            File::put($svgPath, $svgContent);

            $project->update(['cover_image' => "projects/{$project->slug}/cover.svg"]);
            $generated++;
        }

        return $generated;
    }

    /**
     * Optimize an image by resizing if necessary and compressing to WebP/JPEG.
     *
     * @param  string  $sourcePath  Path to raw source image
     * @param  string  $targetPathWithoutExt  Destination file path without extension
     * @param  int  $maxWidth  Max width constraint
     * @param  int  $quality  Compression quality (1-100)
     * @return string Final extension ('webp', 'jpg', etc.)
     */
    protected function optimizeAndSaveImage(string $sourcePath, string $targetPathWithoutExt, int $maxWidth = 1280, int $quality = 82): string
    {
        if (! extension_loaded('gd') || ! file_exists($sourcePath)) {
            $ext = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
            File::copy($sourcePath, "{$targetPathWithoutExt}.{$ext}");

            return $ext;
        }

        $imageInfo = @getimagesize($sourcePath);
        if (! $imageInfo) {
            $ext = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
            File::copy($sourcePath, "{$targetPathWithoutExt}.{$ext}");

            return $ext;
        }

        [$width, $height, $type] = $imageInfo;

        $srcImage = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : null,
            default => null,
        };

        if (! $srcImage) {
            $ext = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
            File::copy($sourcePath, "{$targetPathWithoutExt}.{$ext}");

            return $ext;
        }

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round(($height / $width) * $maxWidth);
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        $destImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for PNG / WebP
        if ($type === IMAGETYPE_PNG || $type === IMAGETYPE_WEBP) {
            imagealphablending($destImage, false);
            imagesavealpha($destImage, true);
            $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
            imagefilledrectangle($destImage, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($destImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($srcImage);

        // Prefer WebP if supported, fallback to JPEG
        if (function_exists('imagewebp')) {
            $finalPath = "{$targetPathWithoutExt}.webp";
            imagewebp($destImage, $finalPath, $quality);
            imagedestroy($destImage);

            return 'webp';
        }

        $finalPath = "{$targetPathWithoutExt}.jpg";
        imagejpeg($destImage, $finalPath, $quality);
        imagedestroy($destImage);

        return 'jpg';
    }

    /**
     * Download a file from Google Drive if public.
     *
     * @return array{content: string, mime: string}|null
     */
    protected function fetchGoogleDriveFile(string $fileId): ?array
    {
        $endpoints = [
            "https://drive.usercontent.google.com/download?id={$fileId}&export=download&authuser=0",
            "https://drive.google.com/uc?export=download&id={$fileId}",
            "https://lh3.googleusercontent.com/d/{$fileId}",
        ];

        foreach ($endpoints as $url) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

            $content = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $mime = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);

            if ($httpCode === 200 && ! empty($content)) {
                // If Google returned an HTML login page instead of actual binary
                if (str_contains($mime, 'text/html') && (str_contains($content, 'accounts.google.com') || str_contains($content, 'ServiceLogin'))) {
                    continue;
                }

                return [
                    'content' => $content,
                    'mime' => $mime,
                ];
            }
        }

        return null;
    }

    /**
     * Extract the Google Drive file ID from a share link.
     */
    public function extractDriveFileId(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }

        if (preg_match('/\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Clean and validate Google Drive link.
     */
    protected function cleanDriveUrl(?string $url): ?string
    {
        $trimmed = trim($url ?? '');

        if ($trimmed === '' || ! str_contains($trimmed, 'drive.google.com')) {
            return null;
        }

        return $trimmed;
    }

    /**
     * Convert MIME type to file extension.
     */
    protected function mimeToExtension(string $mime): string
    {
        return match (strtolower(explode(';', $mime)[0])) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            default => 'bin',
        };
    }

    /**
     * Read raw XLSX rows mapping column letters (A, B, C...) to string values.
     *
     * @return array<int, array<string, string>>
     */
    protected function readXlsxRawRows(string $filePath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($filePath) !== true) {
            throw new RuntimeException("Could not open zip archive: {$filePath}");
        }

        $sharedStrings = [];
        $stringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($stringsXml !== false) {
            $xml = simplexml_load_string($stringsXml);
            if ($xml && isset($xml->si)) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml === false) {
            $zip->close();
            throw new RuntimeException("Worksheet sheet1.xml not found in: {$filePath}");
        }

        $xml = simplexml_load_string($sheetXml);
        $zip->close();

        if (! $xml || ! isset($xml->sheetData->row)) {
            return [];
        }

        $rows = [];
        foreach ($xml->sheetData->row as $row) {
            $rowIndex = (int) $row['r'];
            $cells = [];

            foreach ($row->c as $c) {
                $cellRef = (string) $c['r'];
                preg_match('/^([A-Z]+)(\d+)$/', $cellRef, $matches);
                $colLetter = $matches[1] ?? '';

                $cellType = (string) $c['t'];
                $val = (string) $c->v;

                if ($cellType === 's') {
                    $stringIndex = (int) $val;
                    $cells[$colLetter] = $sharedStrings[$stringIndex] ?? '';
                } else {
                    $cells[$colLetter] = $val;
                }
            }

            $rows[$rowIndex] = $cells;
        }

        return $rows;
    }

    /**
     * Create an SVG cover graphic for a project.
     */
    protected function createProjectCoverSvg(string $title, string $department, string $team): string
    {
        $hash = crc32($title);
        $palettes = [
            ['#0f172a', '#1e293b', '#3b82f6', '#60a5fa'],
            ['#1e1b4b', '#312e81', '#6366f1', '#818cf8'],
            ['#14532d', '#166534', '#22c55e', '#4ade80'],
            ['#701a75', '#86198f', '#d946ef', '#e879f9'],
            ['#18181b', '#27272a', '#06b6d4', '#22d3ee'],
            ['#7c2d12', '#9a3412', '#f97316', '#fb923c'],
        ];
        $p = $palettes[abs($hash) % count($palettes)];

        $cleanTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $cleanDept = htmlspecialchars($department, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $cleanTeam = htmlspecialchars($team, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$p[0]}" />
      <stop offset="50%" stop-color="{$p[1]}" />
      <stop offset="100%" stop-color="{$p[0]}" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{$p[2]}" />
      <stop offset="100%" stop-color="{$p[3]}" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)" />
  <rect width="1280" height="720" fill="url(#grid)" />

  <!-- Ambient Glow Circles -->
  <circle cx="200" cy="180" r="320" fill="{$p[2]}" opacity="0.12" filter="blur(60px)" />
  <circle cx="1080" cy="540" r="350" fill="{$p[3]}" opacity="0.10" filter="blur(70px)" />

  <!-- Department / Track Badge -->
  <g transform="translate(100, 160)">
    <rect width="280" height="42" rx="21" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <circle cx="24" cy="21" r="6" fill="url(#accent)" />
    <text x="44" y="27" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600">{$cleanDept}</text>
  </g>

  <!-- Project Title -->
  <text x="100" y="320" fill="#ffffff" font-family="system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif" font-size="46" font-weight="800" letter-spacing="-0.5">
    {$cleanTitle}
  </text>

  <!-- Accent Rule -->
  <rect x="100" y="360" width="160" height="6" rx="3" fill="url(#accent)" />

  <!-- Team / Exhibition Details -->
  <g transform="translate(100, 440)">
    <text x="0" y="0" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">الفريق:</text>
    <text x="75" y="0" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">{$cleanTeam}</text>
    <text x="0" y="60" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500">معرض المشاريع والابتكارات التقنية 2026</text>
  </g>

  <!-- Subtle Logo/Watermark Mark -->
  <g transform="translate(1120, 100)" opacity="0.4">
    <polygon points="30,0 60,50 0,50" fill="none" stroke="{$p[3]}" stroke-width="4"/>
    <circle cx="30" cy="32" r="10" fill="{$p[2]}"/>
  </g>
</svg>
SVG;
    }
}
