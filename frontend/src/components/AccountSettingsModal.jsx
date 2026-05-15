import { useState } from "react";
import Modal from "./Modal";
import { changePassword, deleteAccount } from "../api/account";

export default function AccountSettingsModal({
  isOpen,
  onClose,
  onAfterDelete,
  onAfterDeactivate,
}) {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [deletePassword, setDeletePassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordSuccess("Password changed successfully");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(
        err?.response?.data?.detail || "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    setDeleteError("");

    try {
      setDeleteLoading(true);

      await deleteAccount({ password: deletePassword });

      if (onAfterDelete) {
        onAfterDelete();
        return;
      }

      if (onAfterDeactivate) {
        onAfterDeactivate();
      }
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings">
      <div className="space-y-8 sm:space-y-10">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <h3 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
              Change Password
            </h3>

            <p className="mt-1 break-words text-sm leading-6 text-slate-600">
              Update your password using your current password.
            </p>
          </div>

          {passwordError && (
            <div className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="break-words rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <input
              type="password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              placeholder="Current password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />

            <input
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              placeholder="New password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />

            <input
              type="password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {passwordLoading ? "Saving..." : "Save New Password"}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-200 pt-8">
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <h3 className="break-words text-lg font-semibold text-red-600 sm:text-xl">
                Delete Profile Permanently
              </h3>

              <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                This will delete your account permanently. If you are a poster,
                your jobs will be removed. If you are a worker, future
                application cleanup will also be supported.
              </p>
            </div>

            {deleteError && (
              <div className="break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeleteError("");
              }}
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              required
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={deleteLoading}
                className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
              >
                {deleteLoading ? "Deleting..." : "Delete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}