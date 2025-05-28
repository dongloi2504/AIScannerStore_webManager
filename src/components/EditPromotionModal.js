import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

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

function EditPromotionModal({ show, onClose, onSave, initialData, products, stores, loading, promotionType }) {
    const [formData, setFormData] = useState({});
    const [ruleList, setRuleList] = useState([]);
    const formRef = useRef(null);

    const [appliedDay, setAppliedDay] = useState(null);

    useEffect(() => {
        if (!initialData || !initialData.detail) return;

        const { code, description, priority, detail, startAt, endAt } = initialData;
        const {
            name,
            amount,
            isPercentage,
            appliedStoreId,
            bonusWalletLifeTimeInHours,
            productId,
            minOrderTotal,
            minCountPerOrder,
            minimumDeposit,
            appliedDayOfWeek,
            startHour,
            endHour,
        } = detail;

        setFormData({
            name,
            amount,
            isPercentage,
            code,
            description,
            appliedStoreId,
            priority,
            bonusWalletLifeTimeInHours,
            productId,
        });

        const rules = [];
        if (minOrderTotal !== undefined) rules.push({ key: "minOrderTotal", value: minOrderTotal });
        if (minCountPerOrder !== undefined) rules.push({ key: "minCountPerOrder", value: minCountPerOrder });
        if (minimumDeposit !== undefined) rules.push({ key: "minimumDeposit", value: minimumDeposit });
        if (startAt && endAt) rules.push({ key: "timeDate", startAt, endAt });
        if (startHour && endHour) rules.push({ key: "timeHour", startHour, endHour });

        setAppliedDay(appliedDayOfWeek ? { label: appliedDayOfWeek, value: appliedDayOfWeek } : null);
        setRuleList(rules);
    }, [initialData]);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleRuleChange = (index, field, value) => {
        const updated = [...ruleList];
        updated[index][field] = value;
        setRuleList(updated);
    };

    const handleAddRule = () => {
        const usedKeys = ruleList.map((r) => r.key);
        const available = getAvailableRules(promotionType).find((r) => !usedKeys.includes(r.key));
        if (available) setRuleList([...ruleList, { key: available.key, value: "" }]);
    };

    const handleRemoveRule = (index) => {
        const updated = [...ruleList];
        updated.splice(index, 1);
        setRuleList(updated);
    };

    const handleSubmit = async () => {
        const form = formRef.current;
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!initialData || !initialData.detail) {
            console.error("initialData or initialData.detail is undefined");
            return;
        }

        const payload = {
            ...initialData,
            detail: {
                ...initialData.detail,
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
            payload.detail.appliedDayOfWeek = appliedDay?.value;
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

        await onSave?.(payload);
        onClose();
    };

    const productOptions = products.map((p) => ({ label: p.productName, value: p.productId }));
    const storeOptions = stores.map((s) => ({ label: s.storeName, value: s.storeId }));
    const dayOptions = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => ({ label: d, value: d }));
    const availableRules = getAvailableRules(promotionType);
    const usedRuleKeys = ruleList.map(r => r.key);
    const ruleOptions = availableRules.filter(r => !usedRuleKeys.includes(r.key));

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit {promotionType.charAt(0).toUpperCase() + promotionType.slice(1)} Promotion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form ref={formRef}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Promotion Name</Form.Label>
                            <Form.Control type="text" required value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Promotion Code</Form.Label>
                            <Form.Control type="text" required value={formData.code || ""} onChange={(e) => handleChange("code", e.target.value)} />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Priority</Form.Label>
                            <Form.Control type="number" value={formData.priority === null ? "" : formData.priority} onChange={(e) => handleChange("priority", Number(e.target.value))} />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Amount</Form.Label>
                            <Form.Control type="number" step="0.01" value={formData.amount || 0} onChange={(e) => handleChange("amount", e.target.value)} required min="0" />
                        </Col>
                        <Col md={6} className="d-flex align-items-end">
                            <Form.Check type="checkbox" label="Is Percentage?" checked={formData.isPercentage || false} onChange={(e) => handleChange("isPercentage", e.target.checked)} />
                        </Col>
                    </Row>

                    {promotionType === "deposit" && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>Applied Day of Week</Form.Label>
                                    <Select options={dayOptions} value={appliedDay || null} onChange={(opt) => setAppliedDay(opt)} />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>Bonus Wallet LifeTime (Hours)</Form.Label>
                                    <Form.Control type="number" min={1} value={formData.bonusWalletLifeTimeInHours || ""} onChange={(e) => handleChange("bonusWalletLifeTimeInHours", Number(e.target.value))} />
                                </Col>
                            </Row>
                        </>
                    )}

                    {promotionType !== "deposit" && (
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label>Store</Form.Label>
                                <Select options={storeOptions} value={formData.appliedStoreId === null ? null : storeOptions.find((opt) => opt.value === formData.appliedStoreId)} onChange={(opt) => handleChange("appliedStoreId", opt?.value)} placeholder="Select store" isDisabled={formData.appliedStoreId === null} />
                            </Col>
                            <Col md={6} className="d-flex align-items-end">
                                <Form.Check type="checkbox" label="All Store?" checked={formData.appliedStoreId === null} onChange={(e) => handleChange("appliedStoreId", e.target.checked ? null : "")} />
                            </Col>
                        </Row>
                    )}

                    {promotionType === "product" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Product</Form.Label>
                            <Select options={productOptions} value={productOptions.find((opt) => opt.value === formData.productId)} onChange={(opt) => handleChange("productId", opt?.value)} placeholder="Select product" required />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
                    </Form.Group>

                    <hr />
                    <h5>Promotion Rules</h5>

                    {ruleList.map((rule, index) => (
                        <div key={index} className="mb-4">
                            <Row className="align-items-center mb-2">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Promotion Rule</Form.Label>
                                        <Select options={ruleOptions.map((r) => ({ label: r.label, value: r.key }))} value={availableRules.find((r) => r.key === rule.key) || null} onChange={(opt) => handleRuleChange(index, "key", opt?.value)} placeholder="Select rule" />
                                    </Form.Group>
                                </Col>
                                <Col md={2} className="text-end">
                                    <Button variant="outline-danger" onClick={() => handleRemoveRule(index)}>✕</Button>
                                </Col>
                            </Row>

                            {rule.key === "timeDate" && (
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Start Date & Time</Form.Label>
                                            <Form.Control type="datetime-local" value={rule.startAt || ""} onChange={(e) => handleRuleChange(index, "startAt", e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>End Date & Time</Form.Label>
                                            <Form.Control type="datetime-local" value={rule.endAt || ""} onChange={(e) => handleRuleChange(index, "endAt", e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {rule.key === "timeHour" && (
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Start Hour</Form.Label>
                                            <Form.Control type="time" value={rule.startHour || ""} onChange={(e) => handleRuleChange(index, "startHour", e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>End Hour</Form.Label>
                                            <Form.Control type="time" value={rule.endHour || ""} onChange={(e) => handleRuleChange(index, "endHour", e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {(rule.key === "minOrderTotal" || rule.key === "minCountPerOrder" || rule.key === "minimumDeposit") && (
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Value</Form.Label>
                                            <Form.Control type="number" value={rule.value} onChange={(e) => handleRuleChange(index, "value", e.target.value)} placeholder="Enter value" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}

                            {rule.key === "appliedDayOfWeek" && (
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Applied Day</Form.Label>
                                            <Select options={dayOptions} value={rule.value || null} onChange={(opt) => handleRuleChange(index, "value", opt)} />
                                        </Form.Group>
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
                    {loading ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</> : "Save Changes"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditPromotionModal;

