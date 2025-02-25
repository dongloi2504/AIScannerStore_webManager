// CreateStoreModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createStore } from '../ServiceApi/apiAdmin';

function CreateStoreModal({ onClose, onStoreCreated }) {
  // Quản lý trạng thái hiển thị modal
  const [show, setShow] = useState(true);

  // State cho hai trường: storeName, storeLocation
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');

  // Đóng modal
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  // Lưu dữ liệu (gọi API)
  const handleSaveChanges = async () => {
    try {
      // Dữ liệu tạo store (chỉ storeName, storeLocation)
      const newStoreData = {
        storeName,
        storeLocation,
      };
      await createStore(newStoreData);
      console.log('Store created successfully');
      // Gọi callback ở cha => reload danh sách, đóng modal
      onStoreCreated();
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Store</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Trường Store Name */}
          <Form.Group className="mb-3" controlId="storeName">
            <Form.Label>Store Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </Form.Group>

          {/* Trường Store Location */}
          <Form.Group className="mb-3" controlId="storeLocation">
            <Form.Label>Store Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Store Location"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateStoreModal;
