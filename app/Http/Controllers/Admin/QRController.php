<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class QRController extends Controller
{
    public function show(Project $project)
    {
        $url = route('project.show', $project->slug);

        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);
        $svg = $writer->writeString($url);

        return inertia('admin/projects/qr', [
            'project' => $project,
            'qrSvg' => $svg,
            'url' => $url,
        ]);
    }
}
