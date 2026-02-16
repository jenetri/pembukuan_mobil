export default function FormTransaksi({
  form,
  setForm,
  editId,
  simpanData,
  updateData
}) {
  const isDisabled =
    !form.tanggal ||
    !form.nopol ||
    !form.hargaBeli ||
    !form.hargaJual;

  return (
    <div className="bg-white p-6 rounded shadow mb-6 grid md:grid-cols-5 gap-4">

      <input
        type="date"
        value={form.tanggal}
        onChange={(e) =>
          setForm({ ...form, tanggal: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="text"
        placeholder="No Polisi"
        value={form.nopol}
        onChange={(e) =>
          setForm({ ...form, nopol: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Harga Beli"
        value={form.hargaBeli}
        onChange={(e) =>
          setForm({ ...form, hargaBeli: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Biaya Tambahan"
        value={form.biaya}
        onChange={(e) =>
          setForm({ ...form, biaya: e.target.value })
        }
        className="border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Harga Jual"
        value={form.hargaJual}
        onChange={(e) =>
          setForm({ ...form, hargaJual: e.target.value })
        }
        className="border p-2 rounded"
      />

      <button
        onClick={editId ? updateData : simpanData}
        disabled={isDisabled}
        className={`col-span-5 p-2 rounded text-white ${
          isDisabled
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {editId ? "Update Transaksi" : "Simpan Transaksi"}
      </button>

    </div>
  );
}