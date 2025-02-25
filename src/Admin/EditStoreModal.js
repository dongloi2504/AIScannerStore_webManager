// EditStoreModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateStore } from '../ServiceApi/apiAdmin';

function EditStoreModal({ store, onClose, onStoreUpdated }) {
  // State cho hiển thị modal
  const [show, setShow] = useState(true);

  // State cho form
  const [storeName, setStoreName] = useState(store.storeName || '');
  const [storeLocation, setStoreLocation] = useState(store.storeLocation || '');

  // Đóng modal
  const handleClose = () => {
    setShow(false);
    onClose();
  };

  // Lưu dữ liệu (gọi API update)
  const handleSaveChanges = async () => {
    try {
      // Gọi API updateStore với đối tượng chứa đầy đủ thông tin
      await updateStore({storeId: store.storeId ,storeName ,storeLocation,});
      console.log('Store updated successfully');
      onStoreUpdated(); // callback: reload + đóng modal
    } catch (error) {
      console.error('Error updating store:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Store</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="storeName">
            <Form.Label>Store Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </Form.Group>

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

export default EditStoreModal;
