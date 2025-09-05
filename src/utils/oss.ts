import axios from 'axios';
import { selectUpload } from '@/api/attach';

export interface OssUploadResult {
  url: string; // public URL
  key: string; // object key
}

/**
 * Upload a file to Aliyun OSS.
 * 1) Request upload config from backend via /attach/upload-select
 * 2) POST form directly to OSS host
 */
export const uploadToOss = async (dir: string, file: File, filename?: string): Promise<OssUploadResult> => {
  // 1. Get config from backend
  const cfgRes = await selectUpload({ dir, storageMode: '' });
  const cfg = cfgRes.data?.config as any;
  if (!cfg || !cfg.host || !cfg.policy || !cfg.signature || !cfg.accessid) {
    throw new Error('上传配置无效');
  }

  // 2. Build object key
  const name = filename || file.name;
  const safeDir = String(cfg.dir || dir || '').replace(/^\/+|\/+$/g, '');
  const key = safeDir ? `${safeDir}/${name}` : name;

  // 3. POST to OSS via form-data
  const form = new FormData();
  form.append('key', key);
  form.append('policy', cfg.policy);
  form.append('OSSAccessKeyId', cfg.accessid);
  form.append('signature', cfg.signature);
  form.append('success_action_status', '200');
  if (cfg['x-oss-security-token']) form.append('x-oss-security-token', cfg['x-oss-security-token']);
  form.append('file', file);

  const host = String(cfg.host).replace(/\/$/, '');
  await axios.post(host, form, { headers: { 'Content-Type': 'multipart/form-data' } });

  const url = `${host}/${key}`;
  return { url, key };
};

