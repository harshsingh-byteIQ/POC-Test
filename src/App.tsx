import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Checkbox,
  DatePicker,
  Space,
  Row,
  Col,
  InputNumber,
  Radio,
  Input,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RangePickerProps } from "antd/es/date-picker";
import "./App.css";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import axios from "axios";
import { TableRowSelection } from "antd/es/table/interface";

dayjs.extend(isBetween);

function App() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [shipmentQtyRange, setShipmentQtyRange] = useState<[number, number]>([
    0, 1000,
  ]);

  const [POQtyRange, setPOQtyRange] = useState<[number, number]>([0, 1000]);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleStatusChange = (e: any) => {
    setStatusFilter(e.target.value);
    filterDataByStatus(e.target.value);
  };

  const filterDataByStatus = (status: string | null) => {
    if (!status) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) => item.model_outcome === status);
    setFilteredData(filtered);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys.slice(-1)),
    getCheckboxProps: (record: any) => ({
      disabled: false,
    }),
  };

  const columns = [
    { title: "Serial No", dataIndex: "serial_no", key: "serial_no" },
    { title: "PO Number", dataIndex: "po_number", key: "po_number" },
    {
      title: "Shipment Number",
      dataIndex: "shipment_number",
      key: "shipment_number",
    },
    { title: "Item Name", dataIndex: "item_name", key: "item_name" },
    { title: "Line Item No", dataIndex: "line_item_no", key: "line_item_no" },
    { title: "PO Item Qty", dataIndex: "po_item_qty", key: "po_item_qty" },
    {
      title: "Shipment Item Qty",
      dataIndex: "shipment_item_qty",
      key: "shipment_item_qty",
    },
    {
      title: "Recommendation",
      dataIndex: "recommendation",
      key: "recommendation",
    },
    {
      title: "Model Outcome",
      dataIndex: "model_outcome",
      key: "model_outcome",
    },
    {
      title: "User Feedback",
      dataIndex: "user_feedback",
      key: "user_feedback",
      render: (text: any) => text || "N/A",
    },
  ];

  const Getdata = async () => {
    try {
      const response = await axios.get(
        "http://192.168.0.84:8000/order/get_all_orders"
      );
      const fetchedData = response.data;
      setData(fetchedData);
      setFilteredData(fetchedData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateData = async (data: any) => {
    try {
      setLoading(true);
      
      const response = await axios.put(
        `http://192.168.0.84:8000/order/update_order/${data.serial_no}`
      );
      Getdata();
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(()=>{
        setLoading(false);
      },800)
    }
  };

  useEffect(() => {
    Getdata();
  }, []);

  const handleShipmentQtyChange = (value: number | null, index: number) => {
    if (value !== null) {
      const newRange = [...shipmentQtyRange] as [number, number];
      newRange[index] = value;
      setShipmentQtyRange(newRange);
    }
  };

  const handlePOQtyChange = (value: number | null, index: number) => {
    if (value !== null) {
      const newRange = [...shipmentQtyRange] as [number, number];
      newRange[index] = value;
      setPOQtyRange(newRange);
    }
  };

  const manageOnClick = (payload : string) => {
    const selectedData = data.filter((item) =>
      selectedRowKeys.includes(item.serial_no)
    );
    selectedData.forEach((item) => {
      item.user_feedback = payload;
      updateData(item);
    });
  };

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.shipment_item_qty >= shipmentQtyRange[0] &&
        item.shipment_item_qty <= shipmentQtyRange[1]
    );
    setFilteredData(filtered);
  }, [shipmentQtyRange, data]);

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.po_item_qty >= POQtyRange[0] && item.po_item_qty <= POQtyRange[1]
    );
    setFilteredData(filtered);
  }, [POQtyRange, data]);

  return (
    <div style={{ padding: 20 }}>
      <Spin spinning={loading}>
        <Row gutter={[20, 20]}>
          <Col
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              height: "90dvh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            span={5}
          >
            <h3>Filter</h3>
            <Radio.Group onChange={handleStatusChange} value={statusFilter}>
              <Radio value="Accept">Approved</Radio>
              <Radio value="Reject">Rejected</Radio>
            </Radio.Group>
            <h4>Deviation Category</h4>
            <h5>Shipment Item Qty Range</h5>
            <Space>
              <InputNumber
                min={0}
                value={shipmentQtyRange[0]}
                onChange={(value) => handleShipmentQtyChange(value, 0)}
              />
              <span>to</span>
              <InputNumber
                min={0}
                value={shipmentQtyRange[1]}
                onChange={(value) => handleShipmentQtyChange(value, 1)}
              />
            </Space>
            <h5>PO Item Qty Range</h5>
            <Space>
              <InputNumber
                min={0}
                value={POQtyRange[0]}
                onChange={(value) => handlePOQtyChange(value, 0)}
              />
              <span>to</span>
              <InputNumber
                min={0}
                value={POQtyRange[1]}
                onChange={(value) => handlePOQtyChange(value, 1)}
              />
            </Space>
            <h4>Recommendation Type</h4>
            <Input
              type="text"
              onChange={(e) => {
                const value = e.target.value;

                const filtered = data.filter((item) =>
                  item.recommendation
                    .toLowerCase()
                    .includes(value.toLowerCase())
                );
                setFilteredData(filtered);
              }}
            ></Input>
          </Col>

          <Col span={18} style={{ height: "80dvh" }}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredData}
              rowKey="serial_no" // Ensure the table recognizes serial_no as the key
              pagination={{ pageSize: 5 }}
            />

            <Row
              style={{ marginTop: "10px", marginBottom: "2vh" }}
              justify={"center"}
              gutter={[20, 20]}
            >
              <Col>
                <Button type="primary" onClick={() => manageOnClick("Accept")}>
                  Accept
                </Button>
              </Col>
              <Col  onClick={() => manageOnClick("Reject")}>
                <Button type="default">Reject</Button>
              </Col>
              <Col>
                <Button type="dashed">Analyse</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default App;
