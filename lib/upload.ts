import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
);

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
    path?: string;
}

export async function uploadGLBFile(
    file: Buffer,
    fileName: string,
    restaurantId: string,
    dishId: string
): Promise<UploadResult> {
    try {
        // Validate file type by checking magic bytes
        const magicBytes = file.slice(0, 4);
        const gltfMagic = Buffer.from([0x67, 0x6c, 0x54, 0x46]); // "glTF"

        if (!magicBytes.equals(gltfMagic)) {
            return {
                success: false,
                error: "Invalid GLB file format. File must be a valid GLB/GLTF file."
            };
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.length > maxSize) {
            return {
                success: false,
                error: "File size exceeds 50MB limit."
            };
        }

// Create path: dish-models/{restaurantId}/{dishId}/model.glb
    const path = `dish-models/${restaurantId}/${dishId}/model.glb`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
        .storage
        .from('dish-models')
        .upload(path, file, {
            contentType: 'model/gltf-binary',
            upsert: true
        });

    if (uploadError) {
        return {
            success: false,
            error: `Upload failed: ${uploadError.message}`
        };
    }

    // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('dish-models')
            .getPublicUrl(path);

        return {
            success: true,
            url: publicUrl,
            path: path
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

export async function uploadQRFile(
    file: Buffer,
    fileName: string,
    restaurantId: string,
    dishId?: string,
    format: 'png' | 'svg' | 'pdf'
): Promise<UploadResult> {
    try {
        const path = dishId 
            ? `qr-codes/${restaurantId}/${dishId}/qr.${format}`
            : `qr-codes/${restaurantId}/menu/qr.${format}`;
        const contentType = format === 'png' ? 'image/png' : format === 'svg' ? 'image/svg+xml' : 'application/pdf';

const { error } = await supabase
        .storage
        .from('qr-codes')
        .upload(path, file, {
            contentType,
            upsert: true
        });

    if (error) {
            return {
                success: false,
                error: `Upload failed: ${error.message}`
            };
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('qr-codes')
            .getPublicUrl(path);

        return {
            success: true,
            url: publicUrl,
            path: path
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

export async function uploadLogoFile(
    file: Buffer,
    restaurantId: string
): Promise<UploadResult> {
    try {
        const path = `logos/${restaurantId}/logo.png`;

const { error } = await supabase
        .storage
        .from('logos')
        .upload(path, file, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
            return {
                success: false,
                error: `Upload failed: ${error.message}`
            };
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('logos')
            .getPublicUrl(path);

        return {
            success: true,
            url: publicUrl,
            path: path
        };
    } catch (error) {
        return {
            success: false,
            error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

export async function deleteFile(path: string, bucket: 'dish-models' | 'qr-codes' | 'logos'): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .storage
            .from(bucket)
            .remove([path]);

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}