import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { useAuth } from "../Authen/AuthContext"; // ✅ sử dụng useAuth

const getAvailableRules = (type) => {
  const rules = [
    ...(type === "order" ? [{ key: "minOrderTotal", label: "Minimum Order Total" }] : []),
    ...(type === "product" ? [{ key: "minCountPerOrder", label: "Minimum Count Per Order" }] : []),
    ...(type === "deposit" ? [{ key: "minimumDeposit", label: "Minimum Deposit" }] : []),
    { key: "timeDate", label: "Time (Date)" },
    ...(type !== "deposit" ? [{ key: "timeHour", label: "Time (Hour)" }] : []),
  ];
  return rules;
};

function CreatePromotionModal({ show, onClose, onSave, products, stores, loading, promotionType }) {
  const { user } = useAuth(); // ✅ dùng useAuth để lấy user

  const [formData, setFormData] = useState({
    name: "",
    amount: 0.1,
    isPercentage: true,
    code: "",
    description: "",
    appliedStoreId: "",
    priority: 0,
    bonusWalletLifeTimeInHours: promotionType === "deposit" ? 1 : 0,
    appliedDayOfWeek: promotionType === "deposit" ? { label: "SUN", value: "SUN" } : null,
    productId: ""
  });

  const [ruleList, setRuleList] = useState([]);
  const formRef = useRef(null);

  // ✅ Auto-assign storeId if role is MANAGER
  useEffect(() => {
      console.log("User object:", user);
    if (user?.role === "STORE_MANAGER" && promotionType !== "deposit") {
      console.log("Auto-assigning storeId to:", user.storeId);
      setFormData((prev) => ({
        ...prev,
        appliedStoreId: user?.storeId || "",
      }));
    }
  }, [promotionType, user]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRuleChange = (index, field, value) => {
    const updated = [...ruleList];
    updated[index][field] = value;
    setRuleList(updated);
  };

  const handleAddRule = () => {
    setRuleList([...ruleList, { key: "", value: "" }]);
  };

  const handleRemoveRule = (index) => {
    const updated = [...ruleList];
    updated.splice(index, 1);
    setRuleList(updated);
  };

  const availableRules = getAvailableRules(promotionType);
  const usedRuleKeys = ruleList.map((r) => r.key);
  const ruleOptions = availableRules.filter((r) => !usedRuleKeys.includes(r.key));
  const dayOptions = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => ({ label: d, value: d }));

  const handleSubmit = async () => {
    const form = formRef.current;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (promotionType !== "deposit" && formData.appliedStoreId !== null && !formData.appliedStoreId) {
      alert("Please select a store or check All Store");
      return;
    }

    if (formData.priority !== null && formData.priority === "") {
      alert("Please set priority or check Highest Priority");
      return;
    }

    if (
      promotionType === "deposit" &&
      (isNaN(formData.bonusWalletLifeTimeInHours) || formData.bonusWalletLifeTimeInHours < 1)
    ) {
      alert("Time to use bonus wallet must be longer than 1 hour");
      return;
    }

    const payload = {
      detail: {
        name: formData.name,
        amount: Number(formData.amount),
        isPercentage: formData.isPercentage,
        appliedStoreId: promotionType === "deposit" ? null : formData.appliedStoreId,
      },
      code: formData.code,
      description: formData.description,
      priority: formData.priority,
    };

    if (promotionType === "deposit") {
      payload.detail.bonusWalletLifeTimeInHours = Number(formData.bonusWalletLifeTimeInHours);
      payload.detail.appliedDayOfWeek = formData.appliedDayOfWeek?.value;
    }

    ruleList.forEach((rule) => {
      const val = Number(rule.value || 0);
      if (rule.key === "minOrderTotal") payload.detail.minOrderTotal = val;
      if (rule.key === "minCountPerOrder") payload.detail.minCountPerOrder = val;
      if (rule.key === "minimumDeposit") payload.detail.minimumDeposit = val;
      if (rule.key === "timeDate") {
        payload.startAt = rule.startAt;
        payload.endAt = rule.endAt;
      }
      if (rule.key === "timeHour") {
        payload.detail.startHour = rule.startHour;
        payload.detail.endHour = rule.endHour;
      }
    });

    if (promotionType === "product") {
      payload.detail.productId = formData.productId;
    }

    try {
      const success = await onSave?.(payload);
      if (success) onClose();
    } catch (err) {
      console.error("Unexpected error in onSave:", err);
    }
  };

  const productOptions = products.map((p) => ({ label: p.productName, value: p.productId }));
  const storeOptions = stores.map((s) => ({ label: s.storeName, value: s.storeId }));

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create {promotionType.charAt(0).toUpperCase() + promotionType.slice(1)} Promotion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form ref={formRef}>
          {/* Common fields */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Promotion Name</Form.Label>
              <Form.Control type="text" required value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </Col>
            <Col md={6}>
              <Form.Label>Promotion Code</Form.Label>
              <Form.Control type="text" required value={formData.code} onChange={(e) => handleChange("code", e.target.value)} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Priority</Form.Label>
              <Form.Control
                type="number"
                value={formData.priority === null ? "" : formData.priority}
                disabled={formData.priority === null}
                onChange={(e) => handleChange("priority", Number(e.target.value))}
              />
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Form.Check
                type="checkbox"
                label="Highest Priority"
                checked={formData.priority === null}
                onChange={(e) => handleChange("priority", e.target.checked ? null : 0)}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" step="0.01" min={0} value={formData.amount} onChange={(e) => handleChange("amount", e.target.value)} required />
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Form.Check
                type="checkbox"
                label="Is Percentage?"
                checked={formData.isPercentage}
                onChange={(e) => handleChange("isPercentage", e.target.checked)}
              />
            </Col>
          </Row>

          {/* Deposit-specific fields */}
          {promotionType === "deposit" && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Bonus Wallet LifeTime (Hours)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={formData.bonusWalletLifeTimeInHours || ""}
                  onChange={(e) => handleChange("bonusWalletLifeTimeInHours", Number(e.target.value))}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Applied Day of Week</Form.Label>
                <Select
                  options={dayOptions}
                  value={formData.appliedDayOfWeek}
                  onChange={(opt) => handleChange("appliedDayOfWeek", opt)}
                  placeholder="Select day"
                />
              </Col>
            </Row>
          )}

          {/* Store selection (only for ADMIN) */}
          {promotionType !== "deposit" && user?.role === "ADMIN" && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Store</Form.Label>
                <Select
                  options={storeOptions}
                  value={formData.appliedStoreId === null ? null : storeOptions.find((opt) => opt.value === formData.appliedStoreId)}
                  onChange={(opt) => handleChange("appliedStoreId", opt?.value)}
                  placeholder="Select store"
                  isDisabled={formData.appliedStoreId === null}
                />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check
                  type="checkbox"
                  label="All Store?"
                  checked={formData.appliedStoreId === null}
                  onChange={(e) => handleChange("appliedStoreId", e.target.checked ? null : "")}
                />
              </Col>
            </Row>
          )}

          {/* Product-specific */}
          {promotionType === "product" && (
            <Form.Group className="mb-3">
              <Form.Label>Product</Form.Label>
              <Select
                options={productOptions}
                value={productOptions.find((opt) => opt.value === formData.productId)}
                onChange={(opt) => handleChange("productId", opt?.value)}
                placeholder="Select product"
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
          </Form.Group>

          {/* Rules section */}
          <hr />
          <h5>Promotion Rules</h5>

          {ruleList.map((rule, index) => (
            <div key={index} className="mb-4">
              <Row className="align-items-center mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Promotion Rule</Form.Label>
                    <Select
                      options={ruleOptions.map((r) => ({ label: r.label, value: r.key }))}
                      value={availableRules.find((r) => r.key === rule.key) || null}
                      onChange={(opt) => handleRuleChange(index, "key", opt?.value)}
                      placeholder="Select rule"
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="text-end">
                  <Button variant="outline-danger" onClick={() => handleRemoveRule(index)}>✕</Button>
                </Col>
              </Row>

              {rule.key === "timeDate" && (
                <Row>
                  <Col md={6}>
                    <Form.Label>Start Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={rule.startAt || ""}
                      onChange={(e) => handleRuleChange(index, "startAt", e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>End Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={rule.endAt || ""}
                      onChange={(e) => handleRuleChange(index, "endAt", e.target.value)}
                    />
                  </Col>
                </Row>
              )}

              {rule.key === "timeHour" && (
                <Row>
                  <Col md={6}>
                    <Form.Label>Start Hour</Form.Label>
                    <Form.Control
                      type="time"
                      value={rule.startHour || ""}
                      onChange={(e) => handleRuleChange(index, "startHour", e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>End Hour</Form.Label>
                    <Form.Control
                      type="time"
                      value={rule.endHour || ""}
                      onChange={(e) => handleRuleChange(index, "endHour", e.target.value)}
                    />
                  </Col>
                </Row>
              )}

              {(rule.key === "minOrderTotal" || rule.key === "minCountPerOrder" || rule.key === "minimumDeposit") && (
                <Row>
                  <Col md={6}>
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      type="number"
                      value={rule.value}
                      onChange={(e) => handleRuleChange(index, "value", e.target.value)}
                      placeholder="Enter value"
                    />
                  </Col>
                </Row>
              )}
            </div>
          ))}

          <div className="mb-3">
            <Button variant="outline-secondary" onClick={handleAddRule} disabled={ruleOptions.length === 0}>
              + Add Rule
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Close</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : "Save Promotion"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreatePromotionModal;
