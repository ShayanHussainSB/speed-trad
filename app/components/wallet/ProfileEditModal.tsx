"use client";

import { useState, useRef } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { AvatarIcon, AVATAR_OPTIONS } from "@/app/components/avatars/AvatarIcon";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatar: string;
  onSave: (username: string, avatar: string) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  currentUsername,
  currentAvatar,
  onSave,
}: ProfileEditModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "pepe");
  const [error, setError] = useState("");
  const wasOpenRef = useRef(false);

  // Sync state when modal opens - this is the recommended React pattern for
  // deriving state from props. Using refs to track previous open state.
  /* eslint-disable react-hooks/refs */
  if (isOpen && !wasOpenRef.current) {
    wasOpenRef.current = true;
    if (username !== currentUsername) setUsername(currentUsername);
    if (selectedAvatar !== (currentAvatar || "pepe")) setSelectedAvatar(currentAvatar || "pepe");
    if (error !== "") setError("");
  } else if (!isOpen && wasOpenRef.current) {
    wasOpenRef.current = false;
  }
  /* eslint-enable react-hooks/refs */

  const handleSave = () => {
    // Validate username
    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 16) {
      setError("Username must be 16 characters or less");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Only letters, numbers, and underscores allowed");
      return;
    }

    onSave(trimmedUsername, selectedAvatar);
    onClose();
  };

  if (!isOpen) return null;

  const selectedAvatarData = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-2 shadow-lg shadow-[var(--accent-primary)]/20 ring-2 ring-[var(--accent-primary)]">
              <AvatarIcon avatarId={selectedAvatar} size={80} />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              {selectedAvatarData?.label || "Select an avatar"}
            </p>
          </div>

          {/* Avatar Grid */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide mb-2 sm:mb-3">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`
                    w-10 h-10 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden
                    transition-all duration-150 hover:scale-110
                    ${
                      selectedAvatar === avatar.id
                        ? "ring-2 ring-[var(--accent-primary)] shadow-lg"
                        : "hover:ring-1 hover:ring-[var(--border-subtle)]"
                    }
                  `}
                  title={avatar.label}
                >
                  <AvatarIcon avatarId={avatar.id} size={40} />
                </button>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Enter your degen name..."
              maxLength={16}
              className={`
                w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border text-sm
                text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all
                ${error ? "border-[var(--color-short)]" : "border-[var(--border-subtle)]"}
              `}
            />
            <div className="flex items-center justify-between mt-2">
              {error ? (
                <p className="text-xs text-[var(--color-short)]">{error}</p>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Letters, numbers, and underscores only
                </p>
              )}
              <span className="text-xs text-[var(--text-tertiary)]">
                {username.length}/16
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditModal;
