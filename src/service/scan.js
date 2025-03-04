import * as XLSX from "xlsx";
import path from "node:path";
import fs from "node:fs";

function getAllCsv(root) {
	const files = fs.readdirSync(root);
	const reg = /\.csv$/i;
	let ret = [];
	for (const file of files) {
		if (file == ".DS_Store") continue;
		const filePath = path.resolve(root, file);
		if (fs.statSync(filePath).isFile()) {
			if (reg.test(file)) ret.push(path.resolve(root, file));
		} else {
			ret = ret.concat(getAllCsv(path.resolve(root, file)));
		}
	}
	return ret;
}

export function scan(win, folder, sns, addressList) {
	const log = function (text, type = "info") {
		const date = new Date();
		win.webContents.send("scanLog", {
			time: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
			type,
			text,
		});
	};

	if (!folder) {
		log("没有选择保存地址", "error");
		return;
	}
	log("开始扫描");
	let targetFiles = [];
	for (const address of addressList) {
		const files = getAllCsv(address);
		targetFiles = targetFiles.concat(files);
	}
	log("扫描结束，共有" + targetFiles.length + "个文件");
	if (targetFiles.length == 0) {
		log("没有找到任何文件", "error");
		return;
	}

	const aoj = [];
	for (let i = 0; i < targetFiles.length; i++) {
		if (i % 10 == 0) {
			log(`正在分析第 ${i + 1} 个文件`);
		}
		const wb = XLSX.readFile(targetFiles[i]);
		const sheetName = wb.SheetNames[0];
		const sheet = wb.Sheets[sheetName];
		const sheetData = XLSX.utils.sheet_to_json(sheet);
		for (const r of sheetData) {
			const sn = r["晶棒编号"];
			if (sns.includes(sn)) {
				aoj.push(r);
			}
		}
	}
	log("分析完成，开始生成文件");
	const date = new Date();
	const wb = XLSX.utils.book_new();
	const sheet = XLSX.utils.json_to_sheet(aoj);
	XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
	XLSX.writeFile(
		wb,
		path.resolve(
			folder,
			`dmt-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.csv`
		)
	);
	log("文件生成完成", "done");
}
