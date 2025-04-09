import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";

function GenericModal({ show, title, fields, onSave, onClose }) {
  const [saving, setSaving] = React.useState(false);

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      await onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setSaving(false);
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

            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveChanges} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GenericModal;
