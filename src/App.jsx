import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    tanggal: "",
    nopol: "",
    hargaBeli: "",
    biaya: "",
    hargaJual: "",
  });
  const [editId, setEditId] = useState(null);
  const [filterTanggal, setFilterTanggal] = useState("");

  // ===============================
  // LOAD DATA
  // ===============================
  const loadData = async () => {
    const { data, error } = await supabase
      .from("transaksi")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("Load error:", error);
    } else {
      setData(data || []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===============================
  // FORMAT RUPIAH
  // ===============================
  const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka || 0);

  // ===============================
  // SIMPAN / UPDATE
  // ===============================
  const simpanData = async () => {
    if (!form.tanggal || !form.nopol) {
      alert("Isi data dengan lengkap!");
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from("transaksi")
        .update(form)
        .eq("id", editId);

      if (error) console.log("Update error:", error);

      setEditId(null);
    } else {
      const { error } = await supabase
        .from("transaksi")
        .insert([form]); // 🔥 WAJIB ARRAY

      if (error) console.log("Insert error:", error);
    }

    setForm({
      tanggal: "",
      nopol: "",
      hargaBeli: "",
      biaya: "",
      hargaJual: "",
    });

    loadData();
  };

  // ===============================
  // HAPUS
  // ===============================
  const hapusData = async (id) => {
    const yakin = window.confirm("Yakin hapus?");
    if (!yakin) return;

    const { error } = await supabase
      .from("transaksi")
      .delete()
      .eq("id", id);

    if (error) console.log("Delete error:", error);

    loadData();
  };

  // ===============================
  // EDIT
  // ===============================
  const editData = (item) => {
    setForm({
      tanggal: item.tanggal,
      nopol: item.nopol,
      hargaBeli: item.hargaBeli,
      biaya: item.biaya,
      hargaJual: item.hargaJual,
    });
    setEditId(item.id);
  };

  // ===============================
  // FILTER
  // ===============================
  const filteredData = filterTanggal
    ? data.filter((d) =>
        d.tanggal?.startsWith(filterTanggal)
      )
    : data;

  // ===============================
  // TOTAL
  // ===============================
  const totalModal = filteredData.reduce(
    (sum, item) =>
      sum +
      (Number(item.hargaBeli) + Number(item.biaya)),
    0
  );

  const totalPenjualan = filteredData.reduce(
    (sum, item) =>
      sum + Number(item.hargaJual),
    0
  );

  const totalLaba = totalPenjualan - totalModal;

  // ===============================
  // EXPORT EXCEL
  // ===============================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const file = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([file]),
      "Laporan_Pembukuan.xlsx"
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pembukuan Mobil</h1>

      <h3>Filter Bulan</h3>
      <input
        type="month"
        onChange={(e) =>
          setFilterTanggal(e.target.value)
        }
      />

      <hr />

      <h3>Input Transaksi</h3>

      <input
        type="date"
        value={form.tanggal}
        onChange={(e) =>
          setForm({ ...form, tanggal: e.target.value })
        }
      />
      <input
        placeholder="No Polisi"
        value={form.nopol}
        onChange={(e) =>
          setForm({ ...form, nopol: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Harga Beli"
        value={form.hargaBeli}
        onChange={(e) =>
          setForm({
            ...form,
            hargaBeli: e.target.value,
          })
        }
      />
      <input
        type="number"
        placeholder="Biaya"
        value={form.biaya}
        onChange={(e) =>
          setForm({
            ...form,
            biaya: e.target.value,
          })
        }
      />
      <input
        type="number"
        placeholder="Harga Jual"
        value={form.hargaJual}
        onChange={(e) =>
          setForm({
            ...form,
            hargaJual: e.target.value,
          })
        }
      />

      <button onClick={simpanData}>
        {editId ? "Update" : "Tambah"}
      </button>

      <hr />

      <button onClick={exportExcel}>
        Export Excel
      </button>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>NoPol</th>
            <th>Beli</th>
            <th>Biaya</th>
            <th>Jual</th>
            <th>Laba</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => {
            const laba =
              item.hargaJual -
              (item.hargaBeli + item.biaya);

            return (
              <tr key={item.id}>
                <td>{item.tanggal}</td>
                <td>{item.nopol}</td>
                <td>{rupiah(item.hargaBeli)}</td>
                <td>{rupiah(item.biaya)}</td>
                <td>{rupiah(item.hargaJual)}</td>
                <td
                  style={{
                    color:
                      laba >= 0
                        ? "green"
                        : "red",
                  }}
                >
                  {rupiah(laba)}
                </td>
                <td>
                  <button
                    onClick={() =>
                      editData(item)
                    }
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      hapusData(item.id)
                    }
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <hr />

      <h3>Total</h3>
      <p>Total Modal: {rupiah(totalModal)}</p>
      <p>Total Penjualan: {rupiah(totalPenjualan)}</p>
      <h2
        style={{
          color:
            totalLaba >= 0
              ? "green"
              : "red",
        }}
      >
        Total Laba: {rupiah(totalLaba)}
      </h2>
    </div>
  );
}

export default App;