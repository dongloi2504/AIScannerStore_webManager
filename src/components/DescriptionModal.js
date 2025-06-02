import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function DescriptionModal({
  show,
  onClose,
  onSave,
  initialDescription = "Xin lỗi quý khách, chúng tôi đã kiểm tra và không có gì bất thường.",
}) {
  const [description, setDescription] = useState(initialDescription);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(description.length);
  }, [description]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 254) {
      setDescription(value);
    }
  };

  const handleSave = () => {
    if (charCount <= 254) {
      onSave(description);
    }
  };

  const handleClose = () => {
    setDescription(initialDescription);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nhập mô tả từ chối (tối đa 254 ký tự)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={handleChange}
            placeholder="Nhập mô tả tại đây..."
            style={{
              resize: "none",
              fontSize: "14px",
              minHeight: "120px",
              maxHeight: "250px",
              width: "100%",
            }}
          />
          <div className="mt-2 small text-muted">
            {charCount}/254 ký tự
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={charCount === 0}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DescriptionModal;
