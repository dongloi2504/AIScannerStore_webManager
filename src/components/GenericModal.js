import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

function GenericModal({ show, title, fields, onSave, onClose }) {
  const handleSaveChanges = async () => {
    try {
      await onSave?.(); 
      onClose?.(); // Đóng modal sau khi lưu thành công
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {fields.map((field, index) => (
            <Form.Group className="mb-3" key={index} controlId={field.controlId}>
              <Form.Label>{field.label}</Form.Label>
              <Form.Control
                type={field.type || "text"}
                placeholder={field.placeholder || ""}
                value={field.value}
                onChange={field.onChange}
              />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenericModal;
