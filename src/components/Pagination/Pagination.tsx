import React from "react";
import "./Pagination.scss";

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  return (
    <div className="pagination">
      <button
        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M8.22 11.2801C8.07931 11.4207 8.00018 11.6113 8 11.8101L8 12.1901C8.0023 12.3886 8.08112 12.5784 8.22 12.7201L13.36 17.8501C13.4539 17.9448 13.5817 17.998 13.715 17.998C13.8483 17.998 13.9761 17.9448 14.07 17.8501L14.78 17.1401C14.8741 17.048 14.9271 16.9218 14.9271 16.7901C14.9271 16.6585 14.8741 16.5323 14.78 16.4401L10.33 12.0001L14.78 7.56015C14.8747 7.46626 14.9279 7.33847 14.9279 7.20515C14.9279 7.07183 14.8747 6.94403 14.78 6.85015L14.07 6.15015C13.9761 6.05549 13.8483 6.00225 13.715 6.00225C13.5817 6.00225 13.4539 6.05549 13.36 6.15015L8.22 11.2801Z"
            fill="#1E8CA5"
          />
        </svg>
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15.78 12.7199C15.9207 12.5793 15.9998 12.3887 16 12.1899V11.8099C15.9977 11.6114 15.9189 11.4216 15.78 11.2799L10.64 6.14985C10.5461 6.0552 10.4183 6.00195 10.285 6.00195C10.1517 6.00195 10.0239 6.0552 9.93 6.14985L9.22 6.85985C9.12594 6.95202 9.07293 7.07816 9.07293 7.20985C9.07293 7.34154 9.12594 7.46769 9.22 7.55985L13.67 11.9999L9.22 16.4399C9.12534 16.5337 9.0721 16.6615 9.0721 16.7949C9.0721 16.9282 9.12534 17.056 9.22 17.1499L9.93 17.8499C10.0239 17.9445 10.1517 17.9978 10.285 17.9978C10.4183 17.9978 10.5461 17.9445 10.64 17.8499L15.78 12.7199Z"
            fill="#1E8CA5"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
