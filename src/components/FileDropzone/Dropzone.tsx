import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./Dropzone.scss";

const Dropzone = () => {
  const onDrop: any = useCallback((acceptedFiles: any) => {
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? "active" : ""}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default Dropzone;
