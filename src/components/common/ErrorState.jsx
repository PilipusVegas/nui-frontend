import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const ErrorState = ({ message = "Terjadi kesalahan, silakan coba lagi." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-red-600">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl mb-3" />
      <p className="text-base font-medium">{message}</p>
    </div>
  );
};

export default ErrorState;
