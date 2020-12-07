import React from "react";
import {Button, Modal} from "react-bootstrap";

import './DeleteCredentialModal.css'

export const DeleteCredentialModal = ({ isShown, loading, onDelete, onClose }) => {
  return (
    <Modal
      className='Delete-Modal'
      backdrop='static'
      show={isShown}
      onHide={onClose}
    >
      <Modal.Body className='Body'>
        <h1 className='Title'>Delete credential</h1>
        <p className='Info'>
          Are you sure you want to delete this credential? This action is irreversible.
        </p>
        <Button className='Close-Button' bsSize='large' onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button className='Delete-Button' bsSize='large' onClick={onDelete} disabled={loading}>
          Delete
        </Button>
      </Modal.Body>
    </Modal>
  )
}
