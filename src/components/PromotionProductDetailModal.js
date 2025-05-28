import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function PromotionProductDetailModal({ promotion, show, onClose }) {
  if (!promotion) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Promotion Detail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Code:</strong> {promotion.code}</p>
        <p><strong>Name:</strong> {promotion.detail.name}</p>
        <p>
          <strong>Amount:</strong>{" "}
          {promotion.detail.amount}
          {promotion.detail.isPercentage ? "%" : ""}
        </p>
        <p><strong>Min Count Per Order:</strong> {promotion.detail.minCountPerOrder}</p>
        <p><strong>Applied Store ID:</strong> {promotion.detail.appliedStoreId || "All"}</p>
        <p><strong>Start Hour:</strong> {promotion.detail.startHour}</p>
        <p><strong>End Hour:</strong> {promotion.detail.endHour}</p>
        <p><strong>Start At:</strong> {promotion.startAt}</p>
        <p><strong>End At:</strong> {promotion.endAt}</p>
        <p><strong>Priority:</strong> {promotion.priority}</p>
        <p><strong>Description:</strong> {promotion.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
