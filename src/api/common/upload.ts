import { http } from "@/utils/http";

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
