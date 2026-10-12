/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
  readonly VITE_CLOUDINARY_FLUTTER_UPLOAD_PRESET?: string;
  readonly VITE_CLOUDINARY_FRONTEND_UPLOAD_PRESET?: string;
  readonly VITE_ADMIN_PIN?: string;
  readonly VITE_ADMIN_DASHBOARD_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
