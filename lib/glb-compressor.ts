import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CompressionResult {
  success: boolean;
  originalSize?: number;
  compressedSize?: number;
  outputUrl?: string;
  error?: string;
}

export async function compressGLB(
  inputUrl: string,
  restaurantId: string,
  dishId: string
): Promise<CompressionResult> {
  try {
    const response = await fetch(inputUrl);
    const arrayBuffer = await response.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    const MAX_SIZE = 5 * 1024 * 1024;

    if (originalSize <= MAX_SIZE) {
      return {
        success: true,
        originalSize,
        compressedSize: originalSize,
        outputUrl: inputUrl,
      };
    }

    const uint8Array = new Uint8Array(arrayBuffer);
    const compressed = await compressWithDraco(uint8Array);

    if (!compressed) {
      return {
        success: true,
        originalSize,
        outputUrl: inputUrl,
        error: "Draco compression unavailable, using original",
      };
    }

    const compressedSize = compressed.byteLength;
    const outputPath = `dish-models/${restaurantId}/${dishId}/model-compressed.glb`;

    const { data: _uploadData, error } = await supabase.storage
      .from("dish-models")
      .upload(outputPath, compressed, {
        contentType: "model/gltf-binary",
        upsert: true,
      });

    void _uploadData;

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from("dish-models")
      .getPublicUrl(outputPath);

    return {
      success: true,
      originalSize,
      compressedSize,
      outputUrl: urlData.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function compressWithDraco(
  data: Uint8Array
): Promise<Uint8Array | null> {
  try {
    if (typeof window === "undefined") return null;

    const DracoEncoder = await loadDracoEncoder();
    if (!DracoEncoder) return null;

    const encoder = new DracoEncoder();
    encoder.setDecoderModule(await getDracoDecoder());

    const mesh = encoder.decode(data);
    if (!mesh) return null;

    encoder.setCompressionLevel(10);
    const compressed = encoder.encode(mesh);
    encoder.destroy();

    return compressed;
  } catch {
    return null;
  }
}

const dracoModule: unknown = null;
async function getDracoDecoder() {
  if (dracoModule) return dracoModule;

  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js";
    script.onload = () => {
      (window as unknown as { DracoDecoder: unknown }).DracoDecoder.then(resolve);
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

async function loadDracoEncoder() {
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function suggestOptimization(
  currentSize: number,
  targetSize: number = 5 * 1024 * 1024
): { message: string; severity: "info" | "warning" | "error" } | null {
  const ratio = currentSize / targetSize;

  if (ratio <= 0.5) return null;
  if (ratio <= 0.8) {
    return {
      message: `File is ${((ratio - 0.5) * 100).toFixed(0)}% over target. Consider reducing texture resolution.`,
      severity: "info",
    };
  }
  if (ratio <= 1) {
    return {
      message: `File is ${((ratio - 0.8) * 100).toFixed(0)}% over target. Recommend optimization.`,
      severity: "warning",
    };
  }
  return {
    message: `File exceeds target by ${((ratio - 1) * 100).toFixed(0)}%. Draco compression strongly recommended.`,
    severity: "error",
  };
}