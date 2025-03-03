const readline = require("readline");
const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

function readText(text) {
	return new Promise((resolve, reject) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		// 提示用户输入
		rl.question(text, (answer) => {
			console.log(answer);
			resolve(answer);

			// 关闭 readline 接口
			rl.close();
		});
	});
}

function getAllCsv(root, snList) {
	const files = fs.readdirSync(root);
	let ret = [];
	for (const file of files) {
		if (file == ".DS_Store") continue;
		const filePath = path.resolve(root, file);
		if (fs.statSync(filePath).isFile()) {
			if (snList.some((k) => file.includes(k)))
				ret.push(path.resolve(root, file));
		} else {
			ret = ret.concat(getAllCsv(path.resolve(root, file), snList));
		}
	}
	return ret;
}
async function main() {
	const text = await readText("请输入excel所在的根目录: ");
	// const text = "/Users/liupengke/workspace/miscellaneous/wc/db";
	const dir = path.resolve(text);
	const entry = await readText("请输入记录了晶棒编号列表的excel文件路径: ");
	// const entry = "/Users/liupengke/workspace/miscellaneous/wc/sns.xlsx";
	const entryPath = path.resolve(entry);
	const wb = XLSX.readFile(entryPath);
	const sheet = wb.Sheets[wb.SheetNames[0]];
	const entryJson = XLSX.utils.sheet_to_json(sheet);
	let snList = entryJson.map((item) => item["晶棒编号"]);
	snList = snList.filter((item) => item);
	console.log("目标晶棒编号如下：\n" + snList.join("\n"));

	console.log("开始扫描：" + dir);
	const files = getAllCsv(dir, snList);
	console.log("总共找到：" + files.length + "个文件");
	console.log(files);

	fs.writeFileSync("./out.csv", "", {
		encoding: "utf-8",
		flag: "w",
	});
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		let data = fs.readFileSync(file, "utf-8");
		data = data.trim();
		if (i > 0) {
			const index = data.indexOf("\n");
			data = data.slice(index + 1);
			data = data.trim();
		}
		if (i % 10 == 0) {
			console.log("进度：" + (i + 1) + "/" + files.length);
		}
		fs.writeFileSync("./out.csv", data + "\n", {
			encoding: "utf-8",
			flag: "a+",
		});
	}
	console.log("完成。输出文件为 out.csv");
}
main();
