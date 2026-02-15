import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./login";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    tanggal: "",
    nopol: "",
    hargaBeli: "",
    biaya: "",
    hargaJual: "",
  });

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    const { data, error } = await supabase
      .from("transaksi")
      .select("*")
      .eq("user_id", session.user.id)
      .order("id", { ascending: false });

    if (!error) setData(data);
  };

  // ================= CRUD =================
  const simpanData = async () => {
    await supabase.from("transaksi").insert([
      { ...form, user_id: session.user.id },
    ]);

    resetForm();
    loadData();
  };

  const updateData = async () => {
    await supabase.from("transaksi").update(form).eq("id", editId);

    setEditId(null);
    resetForm();
    loadData();
  };

  const hapusData = async (id) => {
    await supabase.from("transaksi").delete().eq("id", id);
    loadData();
  };

  const resetForm = () => {
    setForm({
      tanggal: "",
      nopol: "",
      hargaBeli: "",
      biaya: "",
      hargaJual: "",
    });
  };

  const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka || 0);

  const totalKeuntungan = data.reduce((total, item) => {
    return (
      total +
      (Number(item.hargaJual || 0) -
        Number(item.hargaBeli || 0) -
        Number(item.biaya || 0))
    );
  }, 0);

  // ================= EXPORT =================
  const exportExcel = () => {
    const exportData = data.map((item) => ({
      Tanggal: item.tanggal,
      NoPol: item.nopol,
      HargaBeli: item.hargaBeli,
      Biaya: item.biaya,
      HargaJual: item.hargaJual,
      Keuntungan:
        Number(item.hargaJual || 0) -
        Number(item.hargaBeli || 0) -
        Number(item.biaya || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "Laporan_Pembukuan.xlsx");
  };

  if (!session) {
    return <Login setSession={setSession} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pembukuan Mobil</h1>

          <div className="flex gap-3">
            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Export Excel
            </button>

            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Keuntungan</p>
            <p className="text-2xl font-bold text-green-600">
              {rupiah(totalKeuntungan)}
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow mb-6 grid md:grid-cols-5 gap-4">
          <input type="date"
            value={form.tanggal}
            onChange={(e)=>setForm({...form,tanggal:e.target.value})}
            className="border p-2 rounded"/>

          <input placeholder="No Polisi"
            value={form.nopol}
            onChange={(e)=>setForm({...form,nopol:e.target.value})}
            className="border p-2 rounded"/>

          <input type="number" placeholder="Harga Beli"
            value={form.hargaBeli}
            onChange={(e)=>setForm({...form,hargaBeli:e.target.value})}
            className="border p-2 rounded"/>

          <input type="number" placeholder="Biaya"
            value={form.biaya}
            onChange={(e)=>setForm({...form,biaya:e.target.value})}
            className="border p-2 rounded"/>

          <input type="number" placeholder="Harga Jual"
            value={form.hargaJual}
            onChange={(e)=>setForm({...form,hargaJual:e.target.value})}
            className="border p-2 rounded"/>

          <button
            onClick={editId ? updateData : simpanData}
            className="bg-blue-600 text-white py-2 rounded-lg md:col-span-5"
          >
            {editId ? "Update Transaksi" : "Tambah Transaksi"}
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">NoPol</th>
                <th className="p-3">Beli</th>
                <th className="p-3">Biaya</th>
                <th className="p-3">Jual</th>
                <th className="p-3">Untung</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item)=>(
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.tanggal}</td>
                  <td className="p-3">{item.nopol}</td>
                  <td className="p-3">{rupiah(item.hargaBeli)}</td>
                  <td className="p-3">{rupiah(item.biaya)}</td>
                  <td className="p-3">{rupiah(item.hargaJual)}</td>
                  <td className="p-3 text-green-600 font-semibold">
                    {rupiah(
                      Number(item.hargaJual || 0) -
                      Number(item.hargaBeli || 0) -
                      Number(item.biaya || 0)
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={()=>{
                        setForm(item);
                        setEditId(item.id);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={()=>hapusData(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default App;