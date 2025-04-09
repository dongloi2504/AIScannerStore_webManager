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

              {field.type === "select" ? (
                <Select
                  options={Array.from(new Set(field.options.map(opt => opt.value)))
                    .map(value => field.options.find(opt => opt.value === value))}
                  value={field.options.find((opt) => opt.value === field.value)}
                  onChange={(selected) =>
                    field.onChange({ target: { value: selected?.value } })
                  }
                  placeholder="-- Select --"
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: 200,
                      backgroundColor: "white",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused
                        ? "#e6f0ff"
                        : state.isSelected
                        ? "#007bff"
                        : "white",
                      color: state.isSelected ? "white" : "black",
                    }),
                  }}
                />
              ) : (
                <Form.Control
                  name={field.controlId}
                  type={field.type || "text"}
                  placeholder={field.placeholder || ""}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
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
