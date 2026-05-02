"use client";

import EditProfileModal from "../../../pages/EditProfile";

export default function ClientEditProfilePage() {
  return (
    <EditProfileModal
      isOpen={true}
      onClose={() => window.history.back()}
    />
  );
}