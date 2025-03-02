import "./App.css";
import { Button, Form, Input, List, Drawer } from "antd";
import { FileSearchOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const STORAGE_KEY = "dmt-data";

export default function App() {
	const [form] = Form.useForm();
	const [sns, setSns] = useState([]);
	const [addressList, setAddressList] = useState([]);
	const [drawerData, setDrawerData] = useState({
		visible: false,
		type: "",
		text: "",
	});
	useEffect(() => {
		const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
		setSns(data.sns || []);
		setAddressList(data.addressList || []);
	}, []);

	const handleEdit = ({ text = "" }) => {
		const list = text
			.split("\n")
			.map((i) => i.trim())
			.filter((i) => i);
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				sns: drawerData.type == "sns" ? list : sns,
				addressList: drawerData.type == "address" ? list : addressList,
			})
		);
		drawerData.type == "sns" ? setSns(list) : setAddressList(list);
		setDrawerData({ visible: false });
	};

	return (
		<div>
			<h1 className="app-title">Dmt - 数据整合工具v1.0</h1>
			<hr style={{ opacity: 0.2 }} />
			<div className="panel">
				<Form>
					<Form.Item label="晶棒编号">
						<List
							header={null}
							size="small"
							footer={
								<Button
									type="dashed"
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
							}
							bordered
							dataSource={sns}
							renderItem={(item, index) => (
								<List.Item>
									{index + 1}. {item}
								</List.Item>
							)}
						/>
					</Form.Item>
					<Form.Item label="网络盘地址">
						<List
							header={null}
							size="small"
							footer={
								<Button
									type="dashed"
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
							}
							bordered
							dataSource={addressList}
							renderItem={(item, index) => (
								<List.Item>
									{index + 1}. {item}
								</List.Item>
							)}
						/>
					</Form.Item>
					<Form.Item label={null}>
						<Button type="primary" htmlType="submit" size="large">
							<FileSearchOutlined /> 扫描并整合数据
						</Button>
					</Form.Item>
				</Form>
			</div>

			<Drawer
				title={
					"修改" + drawerData.type == "address" ? "网络盘地址" : "晶棒编号"
				}
				open={drawerData.visible}
				onClose={() => setDrawerData({ visible: false })}
			>
				{drawerData.visible && (
					<Form
						form={form}
						onFinish={handleEdit}
						initialValues={{ text: drawerData.text }}
					>
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
				)}
			</Drawer>
		</div>
	);
}
