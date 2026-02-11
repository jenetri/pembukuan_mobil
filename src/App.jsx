import { useEffect, useState } from "react";

function App() {
const [data, setData] = useState(() => {
  const saved = localStorage.getItem("transaksi");
  return saved ? JSON.parse(saved) : [];
});
  const [form, setForm] = useState({
    tanggal: "",
    nopol: "",
    hargaBeli: "",
    biaya: "",
    hargaJual: "",
  });
const [editId, setEditId] = useState(null);
  // format rupiah
  const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka || 0);

  // ambil data dari backend
  const loadData = () => {
    fetch("http://localhost:3001/transaksi")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
  localStorage.setItem("transaksi", JSON.stringify(data));
}, [data]);
useEffect(() => {
    loadData();
  }, []);

  // simpan data
  const simpanData = () => {
    fetch("http://localhost:3001/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tanggal: form.tanggal,
        nopol: form.nopol,
        hargaBeli: Number(form.hargaBeli),
        biaya: Number(form.biaya),
        hargaJual: Number(form.hargaJual),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setForm({
          tanggal: "",
          nopol: "",
          hargaBeli: "",
          biaya: "",
          hargaJual: "",
        });
        loadData();
      });
  };

  // hapus data
  const hapusData = (id) => {
    const yakin = window.confirm("Yakin ingin menghapus data ini?");
    if (!yakin) return;

    fetch(`http://localhost:3001/transaksi/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
      });
  };
// hitung total
const totalModal = data.reduce(
  (sum, item) => sum + (item.hargaBeli + item.biaya),
  0
);

const totalPenjualan = data.reduce(
  (sum, item) => sum + item.hargaJual,
  0
);

const totalLaba = totalPenjualan - totalModal;
  return (
    <div style={{ padding: "20px" }}>
      <h1>Pembukuan Jual Beli Mobil</h1>
<h3>Input Transaksi</h3>

<div
  style={{
    display: "grid",
    gap: "8px",
    maxWidth: "320px",
    marginBottom: "16px",
  }}
>
  <input
    type="date"
    value={form.tanggal}
    onChange={(e) =>
      setForm({ ...form, tanggal: e.target.value })
    }
    style={{ padding: "6px" }}
  />

  <input
    type="text"
    placeholder="No Polisi"
    value={form.nopol}
    onChange={(e) =>
      setForm({ ...form, nopol: e.target.value })
    }
    style={{ padding: "6px" }}
  />

  <input
    type="number"
    placeholder="Harga Beli"
    value={form.hargaBeli}
    onChange={(e) =>
      setForm({ ...form, hargaBeli: e.target.value })
    }
    style={{ padding: "6px" }}
  />

  <input
    type="number"
    placeholder="Biaya"
    value={form.biaya}
    onChange={(e) =>
      setForm({ ...form, biaya: e.target.value })
    }
    style={{ padding: "6px" }}
  />

  <input
    type="number"
    placeholder="Harga Jual"
    value={form.hargaJual}
    onChange={(e) =>
      setForm({ ...form, hargaJual: e.target.value })
    }
    style={{ padding: "6px" }}
  />

  <button
    onClick={simpanData}
    style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "8px",
      cursor: "pointer",
    }}
  >
    Simpan
  </button>
</div>
<div style={{ marginBottom: "16px" }}>
  <h3>Ringkasan</h3>
  <p>Total Modal: <b>{rupiah(totalModal)}</b></p>
  <p>Total Penjualan: <b>{rupiah(totalPenjualan)}</b></p>
  <p>
    Total Laba:{" "}
    <b style={{ color: totalLaba >= 0 ? "green" : "red" }}>
      {rupiah(totalLaba)}
    </b>
  </p>
</div>
      <hr />
<div style={{ overflowX: "auto" }}></div>
      <table
  border="1"
  cellPadding="8"
  style={{
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
    minWidth: "700px",
  }}
>
        <thead>
  <tr>
    <th style={{ background: "#f3f4f6" }}>Tanggal</th>
    <th style={{ background: "#f3f4f6" }}>No Polisi</th>
    <th style={{ background: "#f3f4f6" }}>Harga Beli</th>
    <th style={{ background: "#f3f4f6" }}>Biaya</th>
    <th style={{ background: "#f3f4f6" }}>Harga Jual</th>
    <th style={{ background: "#f3f4f6" }}>Laba</th>
    <th style={{ background: "#f3f4f6" }}>Aksi</th>
  </tr>
</thead>
        <tbody>
          {data.map((item) => {
            const laba =
              item.hargaJual - (item.hargaBeli + item.biaya);

            return (
              <tr key={item.id}>
                <td>{item.tanggal}</td>
                <td>{item.nopol}</td>
                <td>{rupiah(item.hargaBeli)}</td>
                <td>{rupiah(item.biaya)}</td>
                <td>{rupiah(item.hargaJual)}</td>
                <td
  style={{
    color: laba >= 0 ? "green" : "red",
    fontWeight: "bold",
  }}
>
  {rupiah(laba)}
</td>
                <td>
                  <button
                    onClick={() => hapusData(item.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export default App;