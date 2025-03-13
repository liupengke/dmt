import "./App.css";
import { Button, Form, Input, List, Drawer, Popconfirm } from "antd";
import {
	FileSearchOutlined,
	EditOutlined,
	FolderOpenOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import genId from "./utils/genId";

const STORAGE_KEY = "dmt-data";

export default function App() {
	const [form] = Form.useForm();
	const [sns, setSns] = useState([]);
	const [addressList, setAddressList] = useState([]);
	const [folder, setFolder] = useState("");
	const [drawerData, setDrawerData] = useState({
		visible: false,
		type: "",
		text: "",
	});
	const [logs, setLogs] = useState([]);
	const appendLog = (evt, args) => {
		setLogs((prev) => [
			...prev,
			{
				time: args.time,
				type: args.type,
				text: args.text,
				id: genId(),
			},
		]);
	};
	useEffect(() => {
		const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
		setSns(data.sns || []);
		setAddressList(data.addressList || []);
		setFolder(data.folder || "");
		// window.dmt.on("scanLog", appendLog);
	}, []);
	useEffect(() => {
		if (drawerData.visible) {
			form.setFieldsValue({ text: drawerData.text });
		}
	}, [drawerData.visible]);

	const saveData = (type, value) => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				sns: type == "sn" ? value : sns,
				addressList: type == "address" ? value : addressList,
				folder: type == "folder" ? value : folder,
			})
		);
	};

	const handleEdit = ({ text = "" }) => {
		const list = text
			.split("\n")
			.map((i) => i.trim())
			.filter((i) => i);

		saveData(drawerData.type, list);
		drawerData.type == "sn" ? setSns(list) : setAddressList(list);
		setDrawerData({ visible: false });
	};

	const startScan = () => {
		window.dmt.invoke("scan", {
			folder: folder,
			sns: sns,
			addressList: addressList,
		});
	};

	return (
		<div>
			<h1 className="app-title">Dmt - 数据整合工具v2.0</h1>
			<hr style={{ opacity: 0.2 }} />
			<div className="panel">
				<div className="left-panel">
					<Form layout="vertical" onFinish={startScan}>
						<Form.Item
							label={
								<div>
									晶棒编号
									<Button
										type="link"
										icon={<EditOutlined />}
										size="small"
										onClick={() =>
											setDrawerData({
												visible: true,
												type: "sn",
												text: sns.join("\n"),
											})
										}
									/>
								</div>
							}
						>
							<List
								header={null}
								size="small"
								footer={null}
								bordered
								dataSource={sns}
								renderItem={(item, index) => (
									<List.Item>
										{index + 1}. <span className="sn">{item}</span>
									</List.Item>
								)}
								style={{
									maxHeight: 180,
									overflowY: "auto",
									backgroundColor: "#fff",
								}}
							/>
						</Form.Item>
						<Form.Item
							label={
								<div>
									扫描文件夹
									<Button
										type="link"
										icon={<EditOutlined />}
										size="small"
										onClick={() =>
											setDrawerData({
												visible: true,
												type: "address",
												text: addressList.join("\n"),
											})
										}
									/>
								</div>
							}
						>
							<List
								header={null}
								size="small"
								footer={null}
								bordered
								dataSource={addressList}
								renderItem={(item, index) => (
									<List.Item
										actions={[
											<Popconfirm
												title="确定移除？"
												onConfirm={() => {
													const list = addressList.filter((i) => i != item);
													saveData("address", list);
													setAddressList(list);
												}}
											>
												<a key="list-loadmore-del">
													<DeleteOutlined />
												</a>
											</Popconfirm>,
										]}
									>
										{index + 1}. <span className="sn">{item}</span>
									</List.Item>
								)}
								style={{
									maxHeight: 180,
									overflowY: "auto",
									backgroundColor: "#fff",
								}}
							/>
						</Form.Item>
						<Form.Item label="保存路径" name="folder">
							<Input placeholder="请输入结果要保存的文件夹" />
						</Form.Item>
						<Form.Item label={null}>
							<div style={{ textAlign: "center" }}>
								<Button type="primary" size="large" htmlType="submit">
									<FileSearchOutlined /> 扫描并整合数据
								</Button>
							</div>
						</Form.Item>
					</Form>
				</div>
				<div className="right-panel">
					<Form layout="vertical">
						<Form.Item label="日志">
							<div className="log">
								{logs.map((item) => (
									<div key={item.id} className="log-item">
										<span className="time">{item.time}</span>：
										<span className={"log-" + item.type}>{item.text}</span>
										{item.type == "done" && (
											<a
												onClick={() =>
													window.dmt.invoke("openFolder", { folder })
												}
											>
												打开文件夹
											</a>
										)}
									</div>
								))}
							</div>
						</Form.Item>
					</Form>
				</div>
			</div>

			<Drawer
				title={
					"修改" + (drawerData.type == "address" ? "网络盘地址" : "晶棒编号")
				}
				open={drawerData.visible}
				onClose={() => setDrawerData({ visible: false })}
				destroyOnClose
			>
				<Form form={form} onFinish={handleEdit}>
					<Form.Item label={null} name="text">
						<Input.TextArea
							value={drawerData.text}
							rows={10}
							placeholder={
								drawerData.type == "address"
									? "添加网络盘地址，每行一个"
									: "添加晶棒编号，每行一个"
							}
						/>
					</Form.Item>
					<Form.Item label={null}>
						<Button type="primary" htmlType="submit">
							保存
						</Button>
					</Form.Item>
				</Form>
			</Drawer>
		</div>
	);
}
