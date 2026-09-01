// hooks/useFiles.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch, refreshAccessToken } from "@/lib/apiFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FileRelatedTo =
  | "Lead"
  | "Contact"
  | "Deal"
  | "Task"
  | "Company"
  | "Invoice"
  | "Customer"
  | "Project";

export interface FileUploader {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FileRecord {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  extension: string;
  folder?: string | null;
  tags: string[];
  description?: string;
  relatedId?: string | null;
  relatedTo?: FileRelatedTo | null;
  version: number;
  previousVersion?: string | null;
  workspaceId: string;
  uploadedBy: FileUploader;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilesResponse {
  files: FileRecord[];
  pagination: FilePagination;
}

export interface FileFilters {
  search?: string;
  folder?: string;
  relatedTo?: FileRelatedTo;
  relatedId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  folders: { folder: string; count: number }[];
  typeBreakdown: Record<string, number>;
}

export interface UpdateFilePayload {
  originalName?: string;
  folder?: string | null;
  tags?: string[];
  description?: string;
}

export interface UploadFileOptions {
  file: File;
  folder?: string;
  tags?: string[];
  description?: string;
  relatedId?: string;
  relatedTo?: FileRelatedTo;
}

// ─── File type display config ──────────────────────────────────────────────────

export const FILE_TYPE_GROUPS: Record<
  string,
  { label: string; mimePatterns: RegExp[] }
> = {
  document: {
    label: "Document",
    mimePatterns: [/pdf/, /msword/, /wordprocessingml/, /rtf/, /plain/],
  },
  spreadsheet: {
    label: "Spreadsheet",
    mimePatterns: [/ms-excel/, /spreadsheetml/, /csv/],
  },
  presentation: {
    label: "Presentation",
    mimePatterns: [/ms-powerpoint/, /presentationml/],
  },
  image: {
    label: "Image",
    mimePatterns: [/^image\//],
  },
  archive: {
    label: "Archive",
    mimePatterns: [/zip/, /rar/, /compressed/],
  },
};

export const getFileTypeGroup = (mimeType: string): string => {
  for (const [group, config] of Object.entries(FILE_TYPE_GROUPS)) {
    if (config.mimePatterns.some((pattern) => pattern.test(mimeType))) {
      return group;
    }
  }
  return "other";
};

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const fileKeys = {
  all: ["files"] as const,
  list: (filters?: FileFilters) => ["files", "list", filters ?? {}] as const,
  record: (relatedTo: FileRelatedTo, relatedId: string) =>
    ["files", "record", relatedTo, relatedId] as const,
  stats: () => ["files", "stats"] as const,
};

// ─── API Calls ─────────────────────────────────────────────────────────────────

const fetchFiles = async (filters?: FileFilters): Promise<FilesResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.folder) params.append("folder", filters.folder);
  if (filters?.relatedTo) params.append("relatedTo", filters.relatedTo);
  if (filters?.relatedId) params.append("relatedId", filters.relatedId);
  if (filters?.tags?.length) {
    filters.tags.forEach((t) => params.append("tags", t));
  }
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/files${query}`);
  return res.data;
};

const fetchRecordFiles = async (
  relatedTo: FileRelatedTo,
  relatedId: string
): Promise<FileRecord[]> => {
  const params = new URLSearchParams({ relatedTo, relatedId });
  const res = await apiFetch(`/files/record?${params.toString()}`);
  return res.data;
};

const fetchStorageStats = async (): Promise<StorageStats> => {
  const res = await apiFetch("/files/stats");
  return res.data;
};

// Upload bypasses apiFetch since it needs multipart/form-data, not JSON —
// mirrors the same 401-refresh-retry pattern apiFetch uses internally so
// an expired token mid-upload doesn't just fail silently.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const uploadFile = async (opts: UploadFileOptions): Promise<FileRecord> => {
  const formData = new FormData();
  formData.append("file", opts.file);
  if (opts.folder) formData.append("folder", opts.folder);
  if (opts.description) formData.append("description", opts.description);
  if (opts.tags?.length) formData.append("tags", JSON.stringify(opts.tags));
  if (opts.relatedId) formData.append("relatedId", opts.relatedId);
  if (opts.relatedTo) formData.append("relatedTo", opts.relatedTo);

  const makeRequest = () =>
    fetch(`${API_BASE}/files`, {
      method: "POST",
      credentials: "include",
      body: formData, // no Content-Type header — browser sets the multipart boundary
    });

  let res = await makeRequest();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }
    res = await makeRequest();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to upload file");
  }

  const body = await res.json();
  return body.data;
};

const uploadNewVersion = async (
  fileId: string,
  file: File
): Promise<FileRecord> => {
  const formData = new FormData();
  formData.append("file", file);

  const makeRequest = () =>
    fetch(`${API_BASE}/files/${fileId}/versions`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

  let res = await makeRequest();

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }
    res = await makeRequest();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to upload new version");
  }

  const body = await res.json();
  return body.data;
};

const fetchDownloadUrl = async (
  fileId: string
): Promise<{ url: string; fileName: string }> => {
  const res = await apiFetch(`/files/${fileId}/download`);
  return res.data;
};

const updateFileApi = async (
  fileId: string,
  payload: UpdateFilePayload
): Promise<FileRecord> => {
  const res = await apiFetch(`/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
};

const attachFileApi = async (
  fileId: string,
  relatedId: string,
  relatedTo: FileRelatedTo
): Promise<FileRecord> => {
  const res = await apiFetch(`/files/${fileId}/attach`, {
    method: "PATCH",
    body: JSON.stringify({ relatedId, relatedTo }),
  });
  return res.data;
};

const detachFileApi = async (fileId: string): Promise<FileRecord> => {
  const res = await apiFetch(`/files/${fileId}/detach`, {
    method: "PATCH",
  });
  return res.data;
};

const restoreFileApi = async (fileId: string): Promise<FileRecord> => {
  const res = await apiFetch(`/files/${fileId}/restore`, {
    method: "PATCH",
  });
  return res.data;
};

const deleteFileApi = async (fileId: string): Promise<void> => {
  await apiFetch(`/files/${fileId}`, { method: "DELETE" });
};

const permanentlyDeleteFileApi = async (fileId: string): Promise<void> => {
  await apiFetch(`/files/${fileId}/permanent`, { method: "DELETE" });
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useFiles = (
  filters?: FileFilters,
  options?: UseQueryOptions<FilesResponse>
) => {
  return useQuery<FilesResponse>({
    queryKey: fileKeys.list(filters),
    queryFn: () => fetchFiles(filters),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useRecordFiles = (
  relatedTo: FileRelatedTo,
  relatedId: string
) => {
  return useQuery<FileRecord[]>({
    queryKey: fileKeys.record(relatedTo, relatedId),
    queryFn: () => fetchRecordFiles(relatedTo, relatedId),
    enabled: !!relatedTo && !!relatedId,
    staleTime: 1000 * 30,
  });
};

export const useStorageStats = () => {
  return useQuery<StorageStats>({
    queryKey: fileKeys.stats(),
    queryFn: fetchStorageStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opts: UploadFileOptions) => uploadFile(opts),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ["files", "list"] });
      queryClient.invalidateQueries({ queryKey: fileKeys.stats() });
      if (file.relatedTo && file.relatedId) {
        queryClient.invalidateQueries({
          queryKey: fileKeys.record(file.relatedTo, file.relatedId),
        });
      }
    },
  });
};

export const useUploadNewVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, file }: { fileId: string; file: File }) =>
      uploadNewVersion(fileId, file),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ["files", "list"] });
      if (file.relatedTo && file.relatedId) {
        queryClient.invalidateQueries({
          queryKey: fileKeys.record(file.relatedTo, file.relatedId),
        });
      }
    },
  });
};

export const useFileDownload = () => {
  return useMutation({
    mutationFn: (fileId: string) => fetchDownloadUrl(fileId),
    onSuccess: ({ url }) => {
      // Signed URL — navigate the browser directly, no extra fetch/blob
      // handling needed since the S3 response headers already carry
      // Content-Disposition with the correct filename
      window.location.href = url;
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      data,
    }: {
      fileId: string;
      data: UpdateFilePayload;
    }) => updateFileApi(fileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", "list"] });
    },
  });
};

export const useAttachFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      relatedId,
      relatedTo,
    }: {
      fileId: string;
      relatedId: string;
      relatedTo: FileRelatedTo;
    }) => attachFileApi(fileId, relatedId, relatedTo),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ["files", "list"] });
      if (file.relatedTo && file.relatedId) {
        queryClient.invalidateQueries({
          queryKey: fileKeys.record(file.relatedTo, file.relatedId),
        });
      }
    },
  });
};

export const useDetachFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => detachFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};

export const useRestoreFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => restoreFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", "list"] });
      queryClient.invalidateQueries({ queryKey: fileKeys.stats() });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};

export const usePermanentlyDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => permanentlyDeleteFileApi(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};