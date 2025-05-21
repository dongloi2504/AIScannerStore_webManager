import Modal from "react-bootstrap/Modal";
import GenericDetail from "../components/GenericDetail";
import Button from "react-bootstrap/Button";
import { Spinner } from 'react-bootstrap';

export const FullScreenModal = ({
  modalTitle,
  loading,
  show,
  onClose,
  error,
  ...details
}) => {
  return (
    <Modal show={show} onHide={onClose} fullscreen centered>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle ?? "Detail"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
          </div>
        ) : error ? (
          <GenericDetail notFound notFoundMessage={error || "Not found!"} />
        ) : (
          <GenericDetail
            {...details}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}