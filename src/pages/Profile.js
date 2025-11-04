import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile, updateAvatar } from "../redux/slices/authSlice";

import {  resolveAvatarUrl } from "../utils/cdn";

export default function Profile() {
  const dispatch = useDispatch();
  const {
    fullName, gender, dateOfBirth, email, phoneNumber, avatarUrl,
    profileLoading, isLoading
  } = useSelector(s => s.auth);

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  const [form, setForm] = useState({
    fullName: "", gender: "", dateOfBirth: "", avatarUrl: "", email: "", phoneNumber: "",
  });
  useEffect(() => {
    setForm({
      fullName: fullName || "",
      gender: gender || "",
      dateOfBirth: dateOfBirth ? dateOfBirth.slice(0, 10) : "",
      avatarUrl: avatarUrl || "",
      email: email || "",
      phoneNumber: phoneNumber || "",
    });
  }, [fullName, gender, dateOfBirth, avatarUrl, email, phoneNumber]);

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    console.log("S3 env:", process.env.REACT_APP_S3_URL);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = {
      fullName: form.fullName?.trim(),
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00` : null,
      avatarUrl: form.avatarUrl?.trim() || null, // nếu đổi qua upload file thì trường này tự set khi BE trả về
      email: form.email?.trim() || null,
      phoneNumber: form.phoneNumber?.trim() || null,
    };
    await dispatch(updateProfile(body));
  };

  // chọn file -> preview
  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // limit ~ 5MB + hình ảnh
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn (>5MB). Hãy chọn ảnh nhỏ hơn.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ file, url });
  };

  // upload file đã chọn
  const onUploadAvatar = async () => {
    if (!preview?.file) return;
    await dispatch(updateAvatar(preview.file));
    URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-slate-500">Cập nhật thông tin quản trị viên</p>
      </div>

      {profileLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          Đang tải hồ sơ…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {preview?.url ? (
                <img src={preview.url} alt="preview" className="h-24 w-24 rounded-full object-cover border" />
              ) : avatarUrl ? (
                <img src={resolveAvatarUrl(avatarUrl)} alt="avatar" className="h-24 w-24 rounded-full object-cover border" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-amber-200 grid place-items-center text-3xl font-semibold text-amber-900">
                  {(form.fullName || "A").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="mt-3">
                <div className="text-lg font-semibold text-slate-800">{form.fullName || "Admin"}</div>
                <div className="text-sm text-slate-500">{form.email || "—"}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-50"
                onChange={onPickFile}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!preview?.file || isLoading}
                  onClick={onUploadAvatar}
                  className="rounded-xl bg-brandBtn text-slate-900 font-semibold px-4 py-2 shadow-brand disabled:opacity-50"
                >
                  {isLoading ? "Đang tải..." : "Tải ảnh lên"}
                </button>
                {preview?.file && (
                  <button
                    type="button"
                    onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}
                    className="rounded-xl border px-4 py-2"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form info */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
                  placeholder="Nguyen Van A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Giới tính</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
                  >
                    <option value="">—</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
                    placeholder="a@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    inputMode="tel"
                    value={form.phoneNumber}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-[15px] outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-brandBtn text-slate-900 font-semibold px-4 py-2.5 shadow-brand disabled:opacity-70"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
