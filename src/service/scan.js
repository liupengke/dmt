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
	const aoj = [];
	for (let i = 0; i < targetFiles.length; i++) {
		if (i % 10 == 0) {
			log(`文件分析进度 ${parseInt(((i + 1) * 100) / targetFiles.length)}%`);
		}
		// const buffer = fs.readFileSync(targetFiles[i], "utf-8");
		const buffer = fs.readFileSync(targetFiles[i]);
		const wb = XLSX.read(buffer, { type: "buffer" });
		const sheetName = wb.SheetNames[0];
		const sheet = wb.Sheets[sheetName];
		const sheetData = XLSX.utils.sheet_to_json(sheet);
		for (const r of sheetData) {
			const sn = r["晶棒编号"];
			if (sns.includes(sn)) {
				aoj.push(r);
			}
		}
		await sleep(100);
	}

	log("文件分析进度100%。开始输出结果");
	const date = new Date();
	const wb = XLSX.utils.book_new();
	const sheet = XLSX.utils.json_to_sheet(aoj);
	XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
	try {
		// XLSX.writeFile(
		// 	wb,
		// 	path.resolve(
		// 		folder,
		// 		`dmt-out-${date.getFullYear()}-${
		// 			date.getMonth() + 1
		// 		}-${date.getDate()}.csv`
		// 	)
		// );
		const outputBuffer = XLSX.write(wb, {
			bookType: "csv",
			type: "buffer",
		});
		fs.writeFileSync(
			path.resolve(
				folder,
				`dmt-out-${date.getFullYear()}-${
					date.getMonth() + 1
				}-${date.getDate()}.csv`
			),
			outputBuffer
		);
	} catch (e) {
		console.log(e);
		log("文件生成失败，程序结束", "error");
		return;
	}
	log("文件生成完成", "done");
}
