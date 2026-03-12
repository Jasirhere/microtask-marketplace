import { useState } from "react";
import Modal from "./Modal";
import { changePassword, deleteAccount } from "../api/account";


export default function AccountSettingsModal({ isOpen, onClose, onAfterDelete }) {
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
      setPasswordError(err?.response?.data?.detail || "Failed to change password");
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
      onAfterDelete();
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings">
      <div className="space-y-10">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="text-xl font-semibold">Change Password</h3>

          {passwordError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}

          <input
            type="password"
            name="current_password"
            value={passwordForm.current_password}
            onChange={handlePasswordChange}
            placeholder="Current password"
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <input
            type="password"
            name="new_password"
            value={passwordForm.new_password}
            onChange={handlePasswordChange}
            placeholder="New password"
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <input
            type="password"
            name="confirm_password"
            value={passwordForm.confirm_password}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            className="w-full rounded-xl border px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {passwordLoading ? "Saving..." : "Save New Password"}
          </button>
        </form>

        <div className="border-t pt-8">
          <form onSubmit={handleDelete} className="space-y-4">
            <h3 className="text-xl font-semibold text-red-600">Delete Profile Permanently</h3>

            <p className="text-sm text-slate-600">
              This will delete your account permanently. If you are a poster, your jobs will be removed.
              If you are a worker, future application cleanup will also be supported.
            </p>

            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-xl border px-4 py-3"
              required
            />

            <button
              type="submit"
              disabled={deleteLoading}
              className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleteLoading ? "Deleting..." : "Delete Profile"}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}