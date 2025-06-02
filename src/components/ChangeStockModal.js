import React from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Select from "react-select";

function ChangeStockModal({
  show,
  onClose,
  onSave,
  productChanges,
  setProductChanges,
  products,
  imageFile,
  setImageFile,
  loading,
}) {
  const handleProductChange = (index, value) => {
    const updated = [...productChanges];
    updated[index].productId = value;
    setProductChanges(updated);
  };

  const handleAmountChange = (index, value) => {
    const updated = [...productChanges];
    updated[index].changeAmount = value;
    setProductChanges(updated);
  };

  const handleAddRow = () => {
    setProductChanges([...productChanges, { productId: "", changeAmount: 0 }]);
  };

  const handleRemoveRow = (index) => {
    const updated = [...productChanges];
    updated.splice(index, 1);
    setProductChanges(updated);
  };

  const handleClose = () => {
    setProductChanges([{ productId: "", changeAmount: 0 }]);
    setImageFile(null);
    onClose();
  };

  const isSaveDisabled =
    productChanges.length === 0 ||
    productChanges.some((p) => !p.productId || Number(p.changeAmount) <= 0);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Change Stock</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Image Upload */}
          <div className="d-flex gap-3 mb-3">
            <Form.Group style={{ flex: 1 }}>
              <Form.Label>I/O Report Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Form.Group>
          </div>

          {/* Product change rows */}
          {productChanges.map((change, index) => (
            <div key={index} className="d-flex gap-3 mb-3 align-items-end">
              {/* Select product */}
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>{index === 0 ? "Product" : ""}</Form.Label>
                <Select
                  options={products
                    .filter((p) => {
                      const selectedIds = productChanges
                        .filter((_, i) => i !== index)
                        .map((item) => item.productId);
                      return !selectedIds.includes(p.productId);
                    })
                    .map((p) => ({
                      value: p.productId,
                      label: p.productName,
                    }))}
                  value={
                    products
                      .map((p) => ({
                        value: p.productId,
                        label: p.productName,
                      }))
                      .find((opt) => opt.value === change.productId) || null
                  }
                  onChange={(selected) =>
                    handleProductChange(index, selected?.value)
                  }
                  placeholder="Select product"
                />
              </Form.Group>

              {/* Change amount input */}
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>{index === 0 ? "Change Amount" : ""}</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={change.changeAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      handleAmountChange(index, val);
                    }
                  }}
                  placeholder="Enter quantity"
                />
              </Form.Group>

              {/* Remove row button */}
              {productChanges.length > 1 && (
                <Button
                  variant="outline-danger"
                  onClick={() => handleRemoveRow(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}

          {/* Add row */}
          <div className="mb-3">
            <Button variant="outline-secondary" onClick={handleAddRow}>
              + Add Product
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={isSaveDisabled || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChangeStockModal;
