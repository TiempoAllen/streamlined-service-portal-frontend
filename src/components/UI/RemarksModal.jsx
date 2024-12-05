import React, { useEffect, useState } from "react";
import { Modal, Collapse, Typography, Spin } from "antd";
import axios from "axios";

const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";


const RemarksModal = ({ isOpen, onClose, requestID }) => {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (isOpen && requestID) {
      fetchRemarks(requestID);
    }
  }, [isOpen, requestID]);

  const fetchRemarks = async (requestID) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/remarks/${requestID}`);
      setRemarks(response.data);
    } catch (error) {
      console.error("Error fetching remarks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group remarks by status
  const groupRemarksByStatus = (remarks) => {
    return remarks.reduce((groups, remark) => {
      const { status } = remark;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(remark);
      return groups;
    }, {});
  };

  const groupedRemarks = groupRemarksByStatus(remarks);

  return (
    <Modal
      title={`Remarks for Request ID: ${requestID}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <Collapse>
          {Object.entries(groupedRemarks).map(([status, remarks]) => (
            <Panel header={`Status: ${status} (${remarks.length})`} key={status}>
              {remarks.map((remark) => (
                <div
                  key={remark.remark_id}
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Paragraph>
                    <Text strong>Content: </Text> {remark.content}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Created By: </Text> {remark.createdBy}
                  </Paragraph>
                  <Paragraph>
                    <Text type="secondary">Datetime: {remark.datetime}</Text>
                  </Paragraph>
                </div>
              ))}
            </Panel>
          ))}
        </Collapse>
      )}
    </Modal>
  );
};

export default RemarksModal;
