import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoWarning, IoCheckmark } from "react-icons/io5";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "warning",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: IoWarning,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: IoWarning,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          buttonBg: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "info":
        return {
          icon: IoCheckmark,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center pt-6 pb-4">
            <div className={`${styles.iconBg} p-4 rounded-full`}>
              <Icon className={`w-8 h-8 ${styles.iconColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${styles.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
