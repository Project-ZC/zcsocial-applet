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

export function getDownloadUrl(url: string) {
	return `${baseUrl}/v1/file/download?url=${url}`
	// return new Promise((resolve, reject) => {
	// 	uni.downloadFile({
	// 		url: `/v1/file/download?url=${url}`,
	// 		success: (res) => {
	// 			resolve(res);
	// 		},
	// 	});
	// });
}
