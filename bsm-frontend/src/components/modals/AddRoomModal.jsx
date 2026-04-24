import { useState } from "react";
import { createRoom } from "../../api/room.api";

export default function AddRoomModal({ houseId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    room_name: "",
    room_price: "",
    electric_price: "",
    water_price: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRoom({
      ...form,
      house_id: houseId
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-bold">➕ Thêm phòng</h3>

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Tên phòng"
          required
          value={form.room_name}
          onChange={(e) =>
            setForm({ ...form, room_name: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Giá phòng"
          value={form.room_price}
          onChange={(e) =>
            setForm({ ...form, room_price: e.target.value })
          }
          onInput={(e) => {
            if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
              e.target.value = e.target.value.replace(/^0+/, '');
            }
          }}
        />

        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Giá điện"
          value={form.electric_price}
          onChange={(e) =>
            setForm({ ...form, electric_price: e.target.value })
          }
          onInput={(e) => {
            if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
              e.target.value = e.target.value.replace(/^0+/, '');
            }
          }}
        />

        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Giá nước"
          value={form.water_price}
          onChange={(e) =>
            setForm({ ...form, water_price: e.target.value })
          }
          onInput={(e) => {
            if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
              e.target.value = e.target.value.replace(/^0+/, '');
            }
          }}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Hủy
          </button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
