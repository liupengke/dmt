import fs from "node:fs";
import { writeToStream } from "@fast-csv/format";

export const headers = [
	"产品ID",
	"时间",
	"晶棒编号",
	"位置编号",
	"理论片数",
	"班次编号",
	"料盒号",
	"线切机号",
	"检测配方",
	"通道",
	"类型",
	"自定义显示",
	"类型描述",
	"瑕疵详情",
	"激光_M_平均厚度",
	"激光_L_平均厚度",
	"激光_R_平均厚度",
	"激光_平均厚度",
	"激光_TTV",
	"激光_最大线痕",
	"激光_最大翘曲",
	"电阻率_Mean阻方",
	"尺寸_尺寸_长",
	"尺寸_尺寸_宽",
	"尺寸_尺寸_长最大边长",
	"尺寸_尺寸_长最小边长",
	"尺寸_尺寸_宽最大边长",
	"尺寸_尺寸_宽最小边长",
	"尺寸_尺寸_长极差",
	"尺寸_尺寸_宽极差",
	"尺寸_尺寸_最大垂直度",
	"尺寸_尺寸_最小垂直度",
	"尺寸_尺寸_右下倒角",
	"尺寸_尺寸_左下倒角",
	"尺寸_尺寸_右上倒角",
	"尺寸_尺寸_左上倒角",
	"尺寸_尺寸_最大边长",
	"尺寸_尺寸_最小边长",
	"尺寸_尺寸_对角线左上到右下",
	"尺寸_尺寸_对角线右上到左下",
	"尺寸_尺寸_对角线极差",
	"尺寸_尺寸_左上左倒角边",
	"尺寸_尺寸_左上上倒角边",
	"尺寸_尺寸_右上上倒角边",
	"尺寸_尺寸_右上右倒角边",
	"尺寸_尺寸_左下左倒角边",
	"尺寸_尺寸_左下下倒角边",
	"尺寸_尺寸_右下下倒角边",
	"尺寸_尺寸_右下右倒角边",
	"尺寸_尺寸_最大直角边",
	"尺寸_尺寸_最小直角边",
	"尺寸_尺寸_交点对角线左上到右下",
	"尺寸_尺寸_交点对角线右上到左下",
	"尺寸_尺寸_交点对角线极差",
	"上脏污_上脏污有无",
	"上脏污_上脏污数量",
	"上脏污_缺角有无",
	"上脏污_缺角数量",
	"上脏污_色差有无",
	"下脏污_下脏污有无",
	"下脏污_下脏污数量",
	"脏污",
	"脏污数量",
	"脏污详细",
	"右崩边_右侧崩有无",
	"右崩边_右侧崩数量",
	"右崩边_右表崩有无",
	"右崩边_右表崩数量",
	"左崩边_左侧崩有无",
	"左崩边_左侧崩数量",
	"左崩边_左表崩有无",
	"左崩边_左表崩数量",
	"前崩边_前侧崩有无",
	"前崩边_前侧崩数量",
	"后崩边_后侧崩有无",
	"后崩边_后侧崩数量",
	"左前崩_左前侧崩有无",
	"左后崩_左后侧崩有无",
	"右后崩_右后侧崩有无",
	"右前崩_右前侧崩有无",
	"崩边",
	"崩边数量",
	"崩边详细",
	"隐裂1_隐裂1有无",
	"隐裂1_隐裂1数量",
	"隐裂2_隐裂2有无",
	"隐裂2_隐裂2数量",
	"隐裂1_前表崩有无",
	"隐裂2_后表崩有无",
	"隐裂3_隐裂3有无",
	"隐裂3_隐裂3数量",
	"隐裂",
	"隐裂数量",
	"隐裂详细",
	"尺寸_尺寸_破片",
	"左崩边_左缺角有无",
	"右崩边_右缺角有无",
	"直流原因汇总",
	"直流原因明细",
	"下脏污_下穿孔有无",
	"下脏污_下穿孔数量",
	"激光_最大厚度",
	"激光_最小厚度",
	"上脏污_上表崩有无",
	"上脏污_上表崩数量",
	"下脏污_下表崩有无",
	"下脏污_下表崩数量",
	"尺寸_尺寸_左上垂直度",
	"尺寸_尺寸_右上垂直度",
	"尺寸_尺寸_左下垂直度",
	"尺寸_尺寸_右下垂直度",
	"激光_平均粗糙度",
];
export default class CsvFile {
	static write(filestream, rows, options) {
		return new Promise((res, rej) => {
			writeToStream(filestream, rows, options)
				.on("error", (err) => rej(err))
				.on("finish", () => res());
		});
	}

	constructor(opts) {
		this.path = opts.path;
		this.writeOpts = {
			headers,
			includeEndRowDelimiter: true,
			alwaysWriteHeaders: true,
		};
		this.create([]);
	}

	create(rows) {
		return CsvFile.write(fs.createWriteStream(this.path), rows, {
			...this.writeOpts,
		});
	}

	append(rows) {
		return CsvFile.write(
			fs.createWriteStream(this.path, { flags: "a" }),
			rows,
			{
				...this.writeOpts,
				// dont write the headers when appending
				writeHeaders: false,
			}
		);
	}

	read() {
		return new Promise((res, rej) => {
			fs.readFile(this.path, (err, contents) => {
				if (err) {
					return rej(err);
				}
				return res(contents);
			});
		});
	}
}
