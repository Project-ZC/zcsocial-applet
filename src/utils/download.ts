// 将返回的流数据转换为url
export function getObjectURL(file: any) {
	let url = null;
	if (window.createObjectURL != undefined) {
		// basic
		url = window.createObjectURL(file);
	} else if (window.webkitURL != undefined) {
		// webkit or chrome
		try {
			url = window.webkitURL.createObjectURL(file);
		} catch (error) {}
	} else if (window.URL != undefined) {
		// mozilla(firefox)
		try {
			url = window.URL.createObjectURL(file);
		} catch (error) {}
	}
	return url;
}

/**
 * @description: 根据文件地址下载文件
 * @param {*} url filename target
 */
export function downloadByUrl(params: any, callback: any) {
	params = params || {};
	const target = params.target || "_blank";
	const tempLink = document.createElement("a");
	tempLink.style.display = "none";
	tempLink.href = params.url;
	tempLink.target = target;
	if (tempLink.download !== undefined) {
		tempLink.setAttribute("download", params.filename || "");
	}
	document.body.appendChild(tempLink);
	tempLink.click();
	document.body.removeChild(tempLink);
	callback && callback({ url: params.url, success: true, msg: "下载成功" });
	window.URL.revokeObjectURL(params.url); //释放
}
/**
 * @description:  流文件下载
 * @data 流文件数据
 * @config{*} filename,blobType
 * @callback 回调函数
 */
export function downloadByBlob(data: any, config: any, callback: any) {
	if (data && data instanceof Blob) {
		config = config || {};
		const filename = config.filename || ""; //加后缀，可以自动识别如.pdf
		const blobType = config.blobType || ""; // 流类型,加后缀时可为空
		let blob = new Blob([data], {
			type: blobType,
		});
		// if (window.navigator.msSaveOrOpenBlob) {
		//   // 兼容IE10
		//   window.navigator.msSaveBlob(blob, filename);
		//   callback && callback({ success: true, msg: '下载成功' })
		// } else {
		let blobURL = window.URL.createObjectURL(blob);
		downloadByUrl({ ...config, url: blobURL }, callback);
		// }
	} else {
		callback && callback({ success: false, msg: "数据为空或数据格式错误" });
	}
}
/* downloadByBlob调用示例
  downloadByBlob(blobData, { filename: "1.xlsx", blobType: "" },()=>{
    this.btnLoadingList.billDownload = false;
  });
  }
*/

// new Blob type
// 扩展名 文档类型
// .aac	AAC audio	audio/aac
// .csv	Comma-separated values (CSV)	text/csv
// .doc	Microsoft Word	application/msword
// .docx	Microsoft Word (OpenXML)	application/vnd.openxmlformats-officedocument.wordprocessingml.document
// .gif	Graphics Interchange Format (GIF)	image/gif
// .jpeg / .jpg	JPEG images	image/jpeg
// .json	JSON format	application/json
// .png	Portable Network Graphics	image/png
// .pdf	Adobe Portable Document Format (PDF)	application/pdf
// .xls	Microsoft Excel	application/vnd.ms-excel
// .xlsx	Microsoft Excel (OpenXML)	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// .zip	ZIP archive	application/application/zip
