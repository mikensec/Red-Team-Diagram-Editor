import { getAllAttachments } from './indexedDB';

export interface StorageStats {
  totalAttachments: number;
  totalSize: number;
  estimatedQuota: number;
  usagePercent: number;
  formattedSize: string;
  formattedQuota: string;
}

export const getStorageStats = async (): Promise<StorageStats> => {
  try {
    // Get all attachments to calculate total size
    const attachments = await getAllAttachments();
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const totalAttachments = attachments.length;

    // Get storage quota if available
    let estimatedQuota = 0;
    let usagePercent = 0;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      
      estimatedQuota = quota;
      usagePercent = quota > 0 ? (usage / quota) * 100 : 0;
    }

    return {
      totalAttachments,
      totalSize,
      estimatedQuota,
      usagePercent,
      formattedSize: formatBytes(totalSize),
      formattedQuota: formatBytes(estimatedQuota),
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      totalAttachments: 0,
      totalSize: 0,
      estimatedQuota: 0,
      usagePercent: 0,
      formattedSize: '0 B',
      formattedQuota: 'Unknown',
    };
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
