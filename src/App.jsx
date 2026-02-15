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

    if (!error) {
      setData(data);
    }
  };

  // ================= CRUD =================
  const simpanData = async () => {
    await supabase.from("transaksi").insert([
      {
        ...form,
        user_id: session.user.id,
      },
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

  // ================= EXPORT EXCEL =================
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

  // ================= LOGIN CHECK =================
  if (!session) {
    return <Login setSession={setSession} />;
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

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

      </div>
    </div>
  );
}

export default App;