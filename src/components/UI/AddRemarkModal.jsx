import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import axios from 'axios';

const AddRemarkModal = ({ isOpen, onClose, requestId, userId, status }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch user full name based on userId
  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_URL}/user/${userId}`)
        .then((response) => {
          const { firstname, lastname } = response.data;
          setUserFullName(`${firstname} ${lastname}`);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [userId]);


  const handleSubmit = async (values) => {
    const { content } = values;
    const createdBy = userFullName; // Use the fetched user full name

    // Validate fields
    if (!content || !createdBy) {
      notification.error({
        message: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    setLoading(true);

    try {
      // Encode query parameters
      const params = new URLSearchParams({
        request_id: requestId.request_id || requestId,
        content,
        createdBy,
        status: status || requestId.status,
      });

      // Make the POST request with encoded parameters
      await axios.post(`${API_URL}/remarks/add?${params.toString()}`);
      
      setLoading(false);
      notification.success({
        message: 'Success',
        description: 'Remark added successfully!',
      });
      form.resetFields();
      onClose(); // Close the modal
    } catch (err) {
      setLoading(false);
      console.error(err);
      notification.error({
        message: 'Error',
        description: 'Error adding remark.',
      });
    }
  };

  return (
    <Modal
      title="Add Remark"
      visible={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="content"
          label="Remark Content"
          rules={[{ required: true, message: 'Please enter remark content!' }]}
        >
          <Input.TextArea placeholder="Enter remark content" />
        </Form.Item>

        <Form.Item
          label="Created By"
        >
          <Input value={userFullName} disabled />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            {loading ? 'Adding Remark...' : 'Add Remark'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddRemarkModal;
