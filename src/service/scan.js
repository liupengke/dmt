import path from "node:path";
import fs from "node:fs";
import CsvFile, { headers } from "./CsvFile";
import { parseFile } from "@fast-csv/parse";

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
function checkFolder(folder) {
	return new Promise((resolve, reject) => {
		fs.access(folder, fs.constants.F_OK, (err) => {
			if (err) resolve(false);
			else resolve(true);
		});
	});
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleCsv(targetFile, csvFile, sns) {
	return new Promise((resolve, reject) => {
		parseFile(targetFile, { headers })
			.on("error", (error) => reject(error))
			.on("data", (r) => {
				const sn = r["晶棒编号"];
				if (sns.includes(sn)) {
					csvFile.append([r]);
				}
			})
			.on("end", () => resolve());
	});
}
export async function scan(win, folder, sns, addressList) {
	const log = function (text, type = "info") {
		const date = new Date();
		win.webContents.send("scanLog", {
			time: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
			type,
			text,
		});
	};

	if (!folder) {
		log("没有选择保存地址，程序结束", "error");
		return;
	}
	log("开始检查文件夹是否可以访问");
	for (const address of [...addressList, folder]) {
		const canAccess = await checkFolder(address);
		if (!canAccess) {
			log(address + " 文件夹无法访问，程序结束", "error");
			return;
		}
	}
	log("文件夹检测完毕，都可以访问");
	log("开始扫描并发现csv数据文件");
	let targetFiles = [];
	for (const address of addressList) {
		const files = getAllCsv(address);
		targetFiles = targetFiles.concat(files);
	}
	log("扫描结束，共有" + targetFiles.length + "个文件");
	if (targetFiles.length == 0) {
		log("没有找到任何文件，程序结束", "error");
		return;
	}
	log("开始分析文件，找到符合要求的晶棒数据");
	const date = new Date();
	const csvFile = new CsvFile({
		path: path.resolve(
			folder,
			`dmt-out-${date.getFullYear()}-${
				date.getMonth() + 1
			}-${date.getDate()}.csv`
		),
	});
	for (let i = 0; i < targetFiles.length; i++) {
		if (i % 10 == 0) {
			log(`文件分析进度 ${parseInt(((i + 1) * 100) / targetFiles.length)}%`);
		}
		try {
			log(`开始处理文件 ${targetFiles[i]}`);
			await handleCsv(targetFiles[i], csvFile, sns);
		} catch (e) {
			console.log(e);
		}
		await sleep(100);
	}

	log("文件生成完成", "done");
}
