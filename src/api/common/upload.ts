import { http } from "@/utils/http";
import { baseUrl } from "./apiConfig";

/******
 * 文件上传
 */

export function upload(data: any) {
	return http({
		url: "/v1/file/upload",
		method: "POST",
		data,
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export function getDownloadUrl(url?: string) {
	// 空值兼容
	if (!url || typeof url !== "string") return "";
	const v = url.trim();
	if (!v) return "";

	// 已是全路径或特殊协议，直接返回
	const lower = v.toLowerCase();
	if (
		lower.startsWith("http://") ||
		lower.startsWith("https://") ||
		lower.startsWith("//") ||
		lower.startsWith("data:") ||
		lower.startsWith("blob:")
	) {
		return v;
	}

	// 否则拼接后端下载地址，并对参数进行编码
	// return `${baseUrl}/v1/file/download?url=${encodeURIComponent(v)}`;
	return `${baseUrl}/v1/file/download?url=${v}`;
	// return new Promise((resolve, reject) => {
	// 	uni.downloadFile({
	// 		url: `/v1/file/download?url=${url}`,
	// 		success: (res) => {
	// 			resolve(res);
	// 		},
	// 	});
	// });
}
