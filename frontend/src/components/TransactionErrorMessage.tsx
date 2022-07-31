import React from "react";

export function TransactionErrorMessage({ message, dismiss }) {
  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error sending transaction: </strong>
        { message }
      <button
        type="button"
        className="btn-close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
      </button>
    </div>
  );
}
