import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const EmptyState = ({ title, description, icon = faFolderOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
      <FontAwesomeIcon icon={icon} className="text-6xl mb-4 text-gray-400" />
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;
