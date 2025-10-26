<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class UploadController extends Controller
{
    public function upload(Request $r)
    {
        // Ambil input files; dukung 'files' (array) atau satu file
        $filesInput = $r->file('files');
        if (!$filesInput) {
            return response()->json(['success'=>false,'error'=>'No files provided'],400);
        }

        $files = is_array($filesInput) ? $filesInput : [$filesInput];
        $urls = [];
        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) { continue; }
            $name = Str::uuid()->toString().'_'.$file->getClientOriginalName();
            $path = $file->storeAs('uploads', $name, 'public');
            $urls[] = url('/storage/'.$path);
        }
        return response()->json(['success'=>true,'data'=>$urls]);
    }
}